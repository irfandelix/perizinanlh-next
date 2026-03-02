import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 

type Params = { tahap: string; };

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
    if (tahapan.includes("BA.V") || tahapan.includes("BA.P")) prefix = "600.4.25";

    return `${prefix}/${noUrutStr}.${month}/17/${tahapan}.${kodeJenis}/${year}`;
};

export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<Params> } 
) {
    let generatedNomorStr: string = '';

    try {
        const { tahap } = await params;
        const rawBody = await request.json();
        let body = rawBody;

        if (rawBody.formData) {
            body = { ...rawBody.formData, ...rawBody };
            delete body.formData;        
        }

        console.log(`[API] Processing Tahap: ${tahap}`);
        const client = await clientPromise;
        const db = client.db(); 
        const collection = db.collection('dokumen'); 

        // ==========================================
        // TAHAP A (REGISTRASI AWAL MPP) 
        // ==========================================
        if (tahap === 'tahap-a') {
            const { year } = getDateParts(body.tanggalMasukDokumen);
            
            const lastDoc = await collection.find({ tanggalMasukDokumen: { $regex: new RegExp(`^${year}`) } })
            .sort({ noUrut: -1 }).limit(1).toArray();

            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            const nomorChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            const newRecord = {
                ...body,
                noUrut, tahun: year, nomorChecklist, statusTerakhir: 'PROSES', createdAt: new Date(),
                nomorUjiBerkas: "", tanggalUjiBerkas: "", nomorBAVerlap: "", tanggalVerlap: "",
                nomorBAPemeriksaan: "", tanggalPemeriksaan: "", nomorRevisi1: "", tanggalRevisi1: "",
                nomorPHP: "", tanggalPHP: "", fileTahapB: "", fileTahapC: "", fileTahapD: "", filePKPLH: "" 
            };
            
            await collection.insertOne(newRecord);
            return NextResponse.json({ success: true, message: `Registrasi Berhasil! Data urutan ke-${noUrut}.`, generatedData: { noUrut, nomorChecklist } });
        }

        // ==========================================
        // REGISTRASI AMDALNET (SABUNGAN NO URUT DENGAN MPP)
        // ==========================================
        else if (tahap === 'amdalnet') {
            const { year } = getDateParts(body.tanggalMasukDokumen);
            
            const lastDoc = await collection.find({ tanggalMasukDokumen: { $regex: new RegExp(`^${year}`) } })
            .sort({ noUrut: -1 }).limit(1).toArray();

            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            const generatedChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            const newRecord = {
                ...body, 
                noUrut: noUrut, 
                tahun: year, 
                // PENTING: Gunakan inputan form JIKA ADA. Jika kosong, baru buat nomor 600.4 otomatis.
                nomorChecklist: body.nomorChecklist || generatedChecklist, 
                sumberData: 'AMDALNET',            
                statusTerakhir: 'PROSES', createdAt: new Date(),
                nomorUjiBerkas: "", tanggalUjiBerkas: "", nomorBAVerlap: "", tanggalVerlap: "",
                nomorBAPemeriksaan: "", tanggalPemeriksaan: "", nomorRevisi1: "", tanggalRevisi1: "",
                nomorPHP: "", tanggalPHP: "", fileTahapB: "", fileTahapC: "", fileTahapD: "", filePKPLH: "" 
            };
            
            await collection.insertOne(newRecord);
            return NextResponse.json({ success: true, message: `Registrasi Amdalnet Berhasil! Mendapat urutan ke-${noUrut}.`, nomorRegistrasiLH: newRecord.nomorChecklist });
        }

        // ==========================================
        // LOGIKA UPDATE (TAHAP B, C, D, E, F, G, PENGEMBALIAN)
        // ==========================================
        const { noUrut } = body; 
        if (!noUrut) return NextResponse.json({ success: false, message: 'No Urut tidak ditemukan di body request.' }, { status: 400 });

        const queryNoUrut = parseInt(noUrut);
        const existingData = await collection.findOne({ noUrut: queryNoUrut }, { sort: { createdAt: -1 } });
        
        if (!existingData) return NextResponse.json({ success: false, message: `Data dengan No Urut ${queryNoUrut} tidak ditemukan.` }, { status: 404 });

        const docId = existingData._id;
        let updateQuery: any = {};

        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = body;
            generatedNomorStr = existingData.nomorUjiBerkas || generateNomor(queryNoUrut, tanggalPenerbitanUa, 'BA.HUA', existingData.jenisDokumen);
            updateQuery = { nomorUjiBerkas: generatedNomorStr, tanggalUjiBerkas: tanggalPenerbitanUa };
        } 
        else if (tahap === 'c' || tahap === 'verlap') {
            const tanggalVerifikasi = body.tanggalVerifikasi || body.tanggalVerlap;
            if (!tanggalVerifikasi) return NextResponse.json({ success: false, message: 'Tanggal wajib diisi.' }, { status: 400 });
            let currentSeq = existingData.seqVerlap; 
            if (!currentSeq) {
                const allDocs = await collection.find({ nomorBAVerlap: { $exists: true, $ne: "" } }).project({ nomorBAVerlap: 1, seqVerlap: 1 }).toArray();
                let maxNumber = 0;
                allDocs.forEach(doc => { if (doc.seqVerlap) { if (doc.seqVerlap > maxNumber) maxNumber = doc.seqVerlap; } else if (doc.nomorBAVerlap) { const match = doc.nomorBAVerlap.match(/\/(\d{3})\./); if (match && match[1]) { const num = parseInt(match[1], 10); if (num > maxNumber) maxNumber = num; } } });
                currentSeq = maxNumber === 0 ? 1 : maxNumber + 2; 
            }
            generatedNomorStr = generateNomor(currentSeq, tanggalVerifikasi, 'BA.V', existingData.jenisDokumen);
            updateQuery = { nomorBAVerlap: generatedNomorStr, tanggalVerlap: tanggalVerifikasi, seqVerlap: currentSeq, status: 'Verifikasi Lapangan Selesai', updatedAt: new Date() };
        }
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = body;
            if (!tanggalPemeriksaan) return NextResponse.json({ success: false, message: 'Tanggal wajib diisi.' }, { status: 400 });
            let currentSeq = existingData.seqPemeriksaan;
            if (!currentSeq) {
                const allDocs = await collection.find({ nomorBAPemeriksaan: { $exists: true, $ne: "" } }).project({ nomorBAPemeriksaan: 1, seqPemeriksaan: 1 }).toArray();
                let maxNumber = 0;
                allDocs.forEach(doc => { if (doc.seqPemeriksaan) { if (doc.seqPemeriksaan > maxNumber) maxNumber = doc.seqPemeriksaan; } else if (doc.nomorBAPemeriksaan) { const match = doc.nomorBAPemeriksaan.match(/\/(\d+)\./); if (match && match[1]) { const num = parseInt(match[1], 10); if (num > maxNumber) maxNumber = num; } } });
                currentSeq = maxNumber === 0 ? 2 : maxNumber + 2; 
            }
            generatedNomorStr = existingData.nomorBAPemeriksaan || generateNomor(currentSeq, tanggalPemeriksaan, 'BA.P', existingData.jenisDokumen);
            updateQuery = { nomorBAPemeriksaan: generatedNomorStr, tanggalPemeriksaan: tanggalPemeriksaan, seqPemeriksaan: currentSeq };
        }
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = body;
            const revisionMap: Record<string, string> = { '1': 'nomorRevisi1', '2': 'nomorRevisi2', '3': 'nomorRevisi3', '4': 'nomorRevisi4', '5': 'nomorRevisi5' };
            const dateMap: Record<string, string> = { '1': 'tanggalRevisi1', '2': 'tanggalRevisi2', '3': 'tanggalRevisi3', '4': 'tanggalRevisi4', '5': 'tanggalRevisi5' };
            const fieldNo = revisionMap[nomorRevisi]; const fieldTgl = dateMap[nomorRevisi];
            if (!fieldNo || !fieldTgl) return NextResponse.json({ success: false, message: 'Nomor Revisi tidak valid.' }, { status: 400 });
            generatedNomorStr = generateNomor(queryNoUrut, tanggalRevisi, `BA.P.${nomorRevisi}`, existingData.jenisDokumen);
            updateQuery = { [fieldNo]: generatedNomorStr, [fieldTgl]: tanggalRevisi, statusTerakhir: 'REVISI' };
        }
        else if (tahap === 'f' || tahap === 'penerimaan') {
            const { tanggalPenyerahanPerbaikan, petugasPenerimaPerbaikan, nomorRevisi } = body;
            const phpFieldMap: Record<string, string> = { '1': 'nomorPHP', '2': 'nomorPHP2', '3': 'nomorPHP3', '4': 'nomorPHP4', '5': 'nomorPHP5' };
            const petugasFieldMap: Record<string, string> = { '1': 'petugasPenerimaPerbaikan', '2': 'petugasPHP2', '3': 'petugasPHP3', '4': 'petugasPHP4', '5': 'petugasPHP5' };
            const dateFieldMap: Record<string, string> = { '1': 'tanggalPHP', '2': 'tanggalPHP2', '3': 'tanggalPHP3', '4': 'tanggalPHP4', '5': 'tanggalPHP5' };
            const fieldNo = phpFieldMap[nomorRevisi]; const fieldPetugas = petugasFieldMap[nomorRevisi]; const fieldTgl = dateFieldMap[nomorRevisi];
            if (!fieldNo) return NextResponse.json({ success: false, message: 'Nomor Revisi PHP tidak valid.' }, { status: 400 });
            let kodeTahapan = 'PHP'; if (nomorRevisi !== '1') kodeTahapan = `PHP.${parseInt(nomorRevisi) - 1}`;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalPenyerahanPerbaikan, kodeTahapan, existingData.jenisDokumen);
            updateQuery = { [fieldNo]: generatedNomorStr, [fieldTgl]: tanggalPenyerahanPerbaikan, [fieldPetugas]: petugasPenerimaPerbaikan, statusTerakhir: 'DIPERIKSA', updatedAt: new Date() };
        }
        else if (tahap === 'g') {
            const { tanggalPembuatanRisalah } = body;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalPembuatanRisalah, 'RPD', existingData.jenisDokumen);
            updateQuery = { tanggalRisalah: tanggalPembuatanRisalah, nomorRisalah: generatedNomorStr };
        }
        else if (tahap === 'pengembalian') {
            const { tanggalPengembalian } = body;
            if (!tanggalPengembalian) return NextResponse.json({ success: false, message: 'Tanggal Pengembalian wajib diisi.' }, { status: 400 });
            updateQuery = { tanggalPengembalian: tanggalPengembalian, statusTerakhir: 'DIKEMBALIKAN', updatedAt: new Date() };
        } else {
            return NextResponse.json({ success: false, message: 'Tahap tidak valid atau URL salah.' }, { status: 400 });
        }

        const updateResult = await collection.updateOne({ _id: docId }, { $set: updateQuery });
        if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) return NextResponse.json({ success: false, message: 'Gagal update data.' }, { status: 500 });

        return NextResponse.json({ success: true, message: `Berhasil update data.`, generatedNomor: generatedNomorStr });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Kesalahan internal." }, { status: 500 });
    }
}