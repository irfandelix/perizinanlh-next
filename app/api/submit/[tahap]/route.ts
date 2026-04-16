import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 
import { getDriveService } from '@/lib/drive'; 
import { Readable } from 'stream';

type Params = { tahap: string; };

// ==========================================
// FUNGSI HELPER PENOMORAN
// ==========================================
const formatToThreeDigits = (num: number) => num.toString().padStart(3, '0');

const getDateParts = (dateString: string) => {
    if (!dateString) { 
        const now = new Date(); 
        return { month: now.getMonth() + 1, year: now.getFullYear() }; 
    }
    const parts = dateString.split('-'); 
    return { month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
};

const getKodeJenisDokumen = (inputJenis: string) => {
    if (!inputJenis) return 'DOK';
    const normalized = inputJenis.trim().toUpperCase();

    const map: Record<string, string> = {
        'SPPL': 'SPPL', 'UKLUPL': 'UKLUPL', 'UKL-UPL': 'UKLUPL',
        'RINTEK LB3': 'RT.LB3', 'PERTEK AIR LIMBAH': 'ST.AL', 'PERTEK EMISI': 'ST.EM', 
        'KAJIAN TEKNIS AIR LIMBAH': 'KT.AL', 'KAJIAN TEKNIS EMISI': 'KT.EM',
        'KT AL': 'KT.AL', 'KT EM': 'KT.EM', 'SLO': 'SLO', 'DPLH': 'DPLH', 'DELH': 'DELH', 'AMDAL': 'AMDAL'
    };
    return map[normalized] || normalized;
};

const generateNomor = (nomorUntukSurat: number, dateString: string, tahapan: string, jenisDokumen: string) => {
    const { month, year } = getDateParts(dateString);
    const kodeJenis = getKodeJenisDokumen(jenisDokumen);
    const noUrutStr = formatToThreeDigits(nomorUntukSurat); 
    
    let prefix = "600.4";
    if (tahapan.includes("BA.V") || tahapan.includes("BA.P")) prefix = "600.4.5";

    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romanMonth = romanMonths[month - 1];

    return `${prefix}/${noUrutStr}.${romanMonth}/17/${tahapan}.${kodeJenis}/${year}`;
};

// ==========================================
// FUNGSI HELPER GOOGLE DRIVE
// ==========================================
const getOrCreateFolder = async (drive: any, folderName: string, parentId: string) => {
    const res = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and '${parentId}' in parents and trashed = false`,
        fields: 'files(id, name)',
    });
    if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;

    const folder = await drive.files.create({
        requestBody: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id',
    });
    return folder.data.id;
};

// ==========================================
// MAIN POST ROUTE
// ==========================================
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<Params> } 
) {
    let generatedNomorStr: string = '';

    try {
        const { tahap } = await params;
        
        const contentType = request.headers.get('content-type') || '';
        let body: Record<string, any> = {};
        
        // Deklarasi file untuk berbagai skenario
        let uploadedFile: File | null = null;
        let fileChecklist: File | null = null;
        let fileTandaTerima: File | null = null;

        // --- 1. PARSING REQUEST ---
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            // Cek jika ada pengiriman JSON string dalam properti 'data' (dipakai di tahap A)
            const stringData = formData.get('data');
            if (stringData && typeof stringData === 'string') {
                body = JSON.parse(stringData);
            }
            
            formData.forEach((value, key) => {
                if (value instanceof File) {
                    if (key === 'fileChecklist') fileChecklist = value;
                    else if (key === 'fileTandaTerima') fileTandaTerima = value;
                    else uploadedFile = value; // Default untuk file tunggal
                } else if (key !== 'data') {
                    body[key] = value;
                }
            });
        } else {
            const rawBody = await request.json();
            body = rawBody.formData ? { ...rawBody.formData, ...rawBody } : rawBody;
            delete body.formData;
        }

        console.log(`[API] Processing Tahap: ${tahap}`);
        const client = await clientPromise;
        const db = client.db(); 
        const collection = db.collection('dokumen'); 

        let driveData: any = null;
        let checklistDriveData: any = null;
        let tandaTerimaDriveData: any = null;

        // --- 2. FUNGSI UPLOAD GOOGLE DRIVE ---
        const handleDriveUpload = async (nomorSurat: string, file: File, namaPemrakarsa: string, subFolderPrefix: string = "") => {
            const drive = getDriveService();
            const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID || "root"; 
            
            const folderName = namaPemrakarsa || 'Dokumen_Tanpa_Nama';
            const folderId = await getOrCreateFolder(drive, folderName, rootFolderId);

            const safeNomor = nomorSurat.replace(/\//g, '_');
            const newFileName = subFolderPrefix 
                ? `${subFolderPrefix} - ${safeNomor} - ${file.name}`
                : `${safeNomor} - ${file.name}`;
            
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const uploadRes = await drive.files.create({
                requestBody: { name: newFileName, parents: [folderId] },
                media: { mimeType: file.type, body: Readable.from(fileBuffer) },
                fields: 'id, webViewLink', 
            });
            return uploadRes.data;
        };

        // --- TAHAP A: REGISTRASI ---
        if (tahap === 'tahap-a') {
            const { year } = getDateParts(body.tanggalMasukDokumen);
            const lastDoc = await collection.find({ tanggalMasukDokumen: { $regex: new RegExp(`^${year}`) } }).sort({ noUrut: -1 }).limit(1).toArray();
            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            const nomorChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            // Upload Multiple Files (Khusus Tahap A)
            if (fileChecklist) {
                checklistDriveData = await handleDriveUpload(nomorChecklist, fileChecklist, body.namaPemrakarsa, "Checklist Kelengkapan");
            }
            if (fileTandaTerima) {
                tandaTerimaDriveData = await handleDriveUpload(nomorChecklist, fileTandaTerima, body.namaPemrakarsa, "Tanda Terima");
            }
            // Fallback jika dikirim pakai 'file' biasa (misal dari script lama)
            if (uploadedFile && !fileChecklist) {
                driveData = await handleDriveUpload(nomorChecklist, uploadedFile, body.namaPemrakarsa, "Surat Permohonan");
            }
            
            const newRecord = {
                ...body, noUrut, tahun: year, nomorChecklist, statusTerakhir: 'PROSES', createdAt: new Date(),
                // Simpan URL dari file yang di-generate sistem
                fileTahapA_Checklist: checklistDriveData ? checklistDriveData.webViewLink : "",
                fileTahapA_TandaTerima: tandaTerimaDriveData ? tandaTerimaDriveData.webViewLink : "",
                // Fallback field lama
                fileTahapA: driveData ? driveData.webViewLink : "", 
                fileTahapA_id: driveData ? driveData.id : ""
            };
            await collection.insertOne(newRecord);
            return NextResponse.json({ success: true, message: `Registrasi Berhasil!`, generatedData: { noUrut, nomorChecklist } });
        }

        // --- AMDALNET ---
        else if (tahap === 'amdalnet') {
            const { year } = getDateParts(body.tanggalMasukDokumen);
            const lastDoc = await collection.find({ tanggalMasukDokumen: { $regex: new RegExp(`^${year}`) } }).sort({ noUrut: -1 }).limit(1).toArray();
            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            const generatedChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            if (uploadedFile) driveData = await handleDriveUpload(generatedChecklist, uploadedFile, body.namaPemrakarsa, "Amdalnet");
            
            const newRecord = {
                ...body, noUrut, tahun: year, nomorChecklist: generatedChecklist, sumberData: 'AMDALNET', statusTerakhir: 'PROSES', createdAt: new Date(),
                fileTahapA: driveData ? driveData.webViewLink : "",
                fileTahapA_id: driveData ? driveData.id : ""
            };
            await collection.insertOne(newRecord);
            return NextResponse.json({ success: true, message: `Registrasi Amdalnet Berhasil!`, nomorChecklist: generatedChecklist });
        }

        // --- UPDATE TAHAP B - G ---
        const { noUrut } = body; 
        if (!noUrut) return NextResponse.json({ success: false, message: 'No Urut tidak ditemukan.' }, { status: 400 });
        const queryNoUrut = parseInt(noUrut);
        const existingData = await collection.findOne({ noUrut: queryNoUrut }, { sort: { createdAt: -1 } });
        if (!existingData) return NextResponse.json({ success: false, message: `Data tidak ditemukan.` }, { status: 404 });
        const docId = existingData._id;
        let updateQuery: any = {};

        // --- TAHAP B: BA HUA ---
        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = body;
            generatedNomorStr = existingData.nomorUjiBerkas || generateNomor(queryNoUrut, tanggalPenerbitanUa, 'BA.HUA', existingData.jenisDokumen);
            if (uploadedFile) driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, "BA HUA");
            updateQuery = { 
                nomorUjiBerkas: generatedNomorStr, tanggalUjiBerkas: tanggalPenerbitanUa, tanggalPenerbitanUa,
                ...(driveData && { fileTahapB: driveData.webViewLink, fileTahapB_id: driveData.id })
            };
        } 
        // --- TAHAP C: VERLAP ---
        else if (tahap === 'c' || tahap === 'verlap') {
            const tgl = body.tanggalVerifikasi || body.tanggalVerlap;
            let currentSeq = existingData.seqVerlap; 
            if (!currentSeq) {
                const allDocs = await collection.find({ nomorBAVerlap: { $exists: true, $ne: "" } }).project({ seqVerlap: 1 }).toArray();
                currentSeq = (Math.max(...allDocs.map(d => d.seqVerlap || 0), 0)) + 2;
            }
            generatedNomorStr = generateNomor(currentSeq, tgl, 'BA.V', existingData.jenisDokumen);
            if (uploadedFile) driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, "BA Verlap");
            updateQuery = { nomorBAVerlap: generatedNomorStr, tanggalVerlap: tgl, seqVerlap: currentSeq, status: 'Verifikasi Selesai', ...(driveData && { fileTahapC: driveData.webViewLink, fileTahapC_id: driveData.id }) };
        }
        // --- TAHAP D: PEMERIKSAAN ---
        else if (tahap === 'd') {
            const tgl = body.tanggalPemeriksaan;
            let currentSeq = existingData.seqPemeriksaan;
            if (!currentSeq) {
                const allDocs = await collection.find({ nomorBAPemeriksaan: { $exists: true, $ne: "" } }).project({ seqPemeriksaan: 1 }).toArray();
                currentSeq = (Math.max(...allDocs.map(d => d.seqPemeriksaan || 0), 0)) + 2;
            }
            generatedNomorStr = existingData.nomorBAPemeriksaan || generateNomor(currentSeq, tgl, 'BA.P', existingData.jenisDokumen);
            if (uploadedFile) driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, "BA Pemeriksaan");
            updateQuery = { nomorBAPemeriksaan: generatedNomorStr, tanggalPemeriksaan: tgl, seqPemeriksaan: currentSeq, ...(driveData && { fileTahapD: driveData.webViewLink, fileTahapD_id: driveData.id }) };
        }
        // --- TAHAP E: REVISI ---
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = body;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalRevisi, `BA.P.${nomorRevisi}`, existingData.jenisDokumen);
            if (uploadedFile) driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, `Revisi ${nomorRevisi}`);
            updateQuery = { 
                [`nomorRevisi${nomorRevisi}`]: generatedNomorStr, [`tanggalRevisi${nomorRevisi}`]: tanggalRevisi, tanggalRevisi, statusTerakhir: 'REVISI',
                ...(driveData && { [`fileRevisi${nomorRevisi}`]: driveData.webViewLink, [`fileRevisi${nomorRevisi}_id`]: driveData.id })
            };
        }
        // --- TAHAP F: PHP (PENYERAHAN PERBAIKAN) ---
        else if (tahap === 'f' || tahap === 'penerimaan') {
            const { tanggalPenyerahanPerbaikan, petugasPenerimaPerbaikan, nomorRevisi } = body;
            const revIdx = parseInt(nomorRevisi);
            const kodeTahapan = revIdx === 1 ? 'PHP' : `PHP.${revIdx - 1}`;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalPenyerahanPerbaikan, kodeTahapan, existingData.jenisDokumen);
            
            // LOGIKA UPLOAD HASIL SCAN SURAT PERMOHONAN PEMERIKSAAN
            if (uploadedFile) {
                driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, "Scan Permohonan Pemeriksaan");
            }

            updateQuery = { 
                [`nomorPHP${revIdx === 1 ? '' : revIdx}`]: generatedNomorStr, 
                [`tanggalPHP${revIdx === 1 ? '' : revIdx}`]: tanggalPenyerahanPerbaikan, 
                [`petugasPHP${revIdx === 1 ? '' : revIdx}`]: petugasPenerimaPerbaikan, 
                statusTerakhir: 'DIPERIKSA', updatedAt: new Date(),
                ...(driveData && { [`filePHPScan${revIdx === 1 ? '' : revIdx}`]: driveData.webViewLink, [`filePHPScan_id${revIdx === 1 ? '' : revIdx}`]: driveData.id })
            };
        }
        // --- TAHAP G: RPD ---
        else if (tahap === 'g') {
            const tgl = body.tanggalPembuatanRisalah;
            const { year: yr } = getDateParts(tgl);
            const lastR = await collection.find({ tahunRisalah: yr, nomorRisalah: { $ne: "" } }).sort({ seqRisalah: -1 }).limit(1).toArray();
            const nxt = lastR.length > 0 ? (lastR[0].seqRisalah || 0) + 1 : 1;
            generatedNomorStr = generateNomor(nxt, tgl, 'RPD', existingData.jenisDokumen);
            if (uploadedFile) driveData = await handleDriveUpload(generatedNomorStr, uploadedFile, existingData.namaPemrakarsa, "Risalah RPD");
            updateQuery = { nomorRisalah: generatedNomorStr, tanggalRisalah: tgl, tahunRisalah: yr, seqRisalah: nxt, ...(driveData && { fileTahapG: driveData.webViewLink, fileTahapG_id: driveData.id }) };
        }
        else if (tahap === 'pengembalian') {
            const { tanggalPengembalian, keteranganPengembalian } = body;
            
            // Jika ada file bukti pengembalian
            if (uploadedFile) driveData = await handleDriveUpload(`KEMBALI_${queryNoUrut}`, uploadedFile, existingData.namaPemrakarsa, "Bukti Pengembalian");
            
            updateQuery = { 
                tanggalPengembalian: tanggalPengembalian, 
                keteranganPengembalian: keteranganPengembalian, 
                statusTerakhir: 'DIKEMBALIKAN', 
                updatedAt: new Date(),
                ...(driveData && { filePengembalian: driveData.webViewLink, filePengembalian_id: driveData.id })
            };
        } 
        else if (tahap === 'arsip') {
            updateQuery = { arsipFisik: body.arsipFisik, updatedAt: new Date() };
        }

        await collection.updateOne({ _id: docId }, { $set: updateQuery });
        return NextResponse.json({ success: true, message: `Berhasil update data.`, generatedNomor: generatedNomorStr });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal error." }, { status: 500 });
    }
}