import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 

// --- DEFINISI TIPE ---
type Params = {
    tahap: string;
};

// --- HELPER FUNCTIONS ---
const formatToThreeDigits = (num: number) => num.toString().padStart(3, '0');

const getDateParts = (dateString: string) => {
    if (!dateString) { 
        const now = new Date(); 
        return { month: now.getMonth() + 1, year: now.getFullYear() }; 
    }
    const parts = dateString.split('-'); 
    return { month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
};

// [PERUBAHAN 1: UPDATE MAPPING KODE DOKUMEN]
const getKodeJenisDokumen = (inputJenis: string) => {
    if (!inputJenis) return 'DOK';
    const normalized = inputJenis.trim().toUpperCase();

    const map: Record<string, string> = {
        'SPPL': 'SPPL', 
        'UKLUPL': 'UKLUPL', 
        'UKL-UPL': 'UKLUPL',
        'RINTEK LB3': 'RT.LB3', 
        'PERTEK AIR LIMBAH': 'ST.AL',
        'PERTEK EMISI': 'ST.EM', 
        
        // Tambahan Baru: Kajian Teknis
        'KAJIAN TEKNIS AIR LIMBAH': 'KT.AL',
        'KAJIAN TEKNIS EMISI': 'KT.EM',
        'KT AL': 'KT.AL', // Opsional: variasi input
        'KT EM': 'KT.EM', // Opsional: variasi input

        'SLO': 'SLO', 
        'DPLH': 'DPLH',
        'DELH': 'DELH', 
        'AMDAL': 'AMDAL'
    };

    // Jika input tidak ada di map, gunakan string aslinya
    return map[normalized] || normalized;
};

// [PERUBAHAN 2: UPDATE PREFIX NOMOR SURAT]
const generateNomor = (nomorUntukSurat: number, dateString: string, tahapan: string, jenisDokumen: string) => {
    const { month, year } = getDateParts(dateString);
    const kodeJenis = getKodeJenisDokumen(jenisDokumen);
    const noUrutStr = formatToThreeDigits(nomorUntukSurat); 
    
    // Tentukan Prefix (Awalan Nomor)
    // Default: 600.4
    // Jika Verlap (BA.V) atau Pemeriksaan (BA.P), gunakan 600.4.25
    let prefix = "600.4";
    if (tahapan.includes("BA.V") || tahapan.includes("BA.P")) {
        prefix = "600.4.25";
    }

    return `${prefix}/${noUrutStr}.${month}/17/${tahapan}.${kodeJenis}/${year}`;
};

// ================= MAIN HANDLER =================

export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<Params> } 
) {
    let generatedNomorStr: string = '';

    try {
        const { tahap } = await params;
        
        // 1. AMBIL RAW BODY & FLATTENING DATA
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
        // TAHAP A (REGISTRASI AWAL) - RESET TAHUNAN
        // ==========================================
        if (tahap === 'tahap-a') {
            const { year } = getDateParts(body.tanggalMasukDokumen);
            
            // Cari dokumen terakhir HANYA di tahun tersebut
            const lastDoc = await collection.find({
                tanggalMasukDokumen: { $regex: new RegExp(`^${year}`) }
            })
            .sort({ noUrut: -1 })
            .limit(1)
            .toArray();

            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            
            // Generate (Akan pakai 600.4 karena tahapan 'REG')
            const nomorChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            const newRecord = {
                ...body,
                noUrut, 
                tahun: year, 
                nomorChecklist,
                statusTerakhir: 'PROSES',
                createdAt: new Date(),
                nomorUjiBerkas: "", tanggalUjiBerkas: "",
                nomorBAVerlap: "", tanggalVerlap: "",
                nomorBAPemeriksaan: "", tanggalPemeriksaan: "",
                nomorRevisi1: "", tanggalRevisi1: "",
                nomorPHP: "", tanggalPHP: "",
                fileTahapB: "", fileTahapC: "", fileTahapD: "", filePKPLH: "" 
            };
            
            await collection.insertOne(newRecord);
            
            return NextResponse.json({ 
                success: true, 
                message: `Registrasi Berhasil! Data urutan ke-${noUrut} di tahun ${year}.`, 
                generatedData: { noUrut, nomorChecklist } 
            });
        }

        // ==========================================
        // LOGIKA UPDATE (TAHAP SELANJUTNYA)
        // ==========================================
        
        const { noUrut } = body; 
        
        if (!noUrut) {
            return NextResponse.json({ success: false, message: 'No Urut tidak ditemukan di body request.' }, { status: 400 });
        }

        const queryNoUrut = parseInt(noUrut);

        // Ambil data terbaru berdasarkan noUrut (sort createdAt desc untuk keamanan tahun)
        const existingData = await collection.findOne(
            { noUrut: queryNoUrut }, 
            { sort: { createdAt: -1 } }
        );
        
        if (!existingData) {
            return NextResponse.json({ success: false, message: `Data dengan No Urut ${queryNoUrut} tidak ditemukan.` }, { status: 404 });
        }

        const docId = existingData._id;
        let updateQuery: any = {};

        // --- TAHAP B (UJI ADMIN) ---
        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = body;
            generatedNomorStr = existingData.nomorUjiBerkas || generateNomor(queryNoUrut, tanggalPenerbitanUa, 'BA.HUA', existingData.jenisDokumen);
            updateQuery = { nomorUjiBerkas: generatedNomorStr, tanggalUjiBerkas: tanggalPenerbitanUa };
        } 
        
        // ---------------------------------------------------------
        // TAHAP C (VERIFIKASI LAPANGAN - BA.V) -> PREFIX 600.4.25
        // ---------------------------------------------------------
        else if (tahap === 'c' || tahap === 'verlap') {
            const tanggalVerifikasi = body.tanggalVerifikasi || body.tanggalVerlap;
            if (!tanggalVerifikasi) return NextResponse.json({ success: false, message: 'Tanggal Verifikasi wajib diisi.' }, { status: 400 });

            let currentSeq = existingData.seqVerlap; 

            if (!currentSeq) {
                // Cari max number dari BA.V yang sudah ada
                const allDocs = await collection.find({ 
                    nomorBAVerlap: { $exists: true, $ne: "" } 
                }).project({ nomorBAVerlap: 1, seqVerlap: 1 }).toArray();

                let maxNumber = 0;

                allDocs.forEach(doc => {
                    if (doc.seqVerlap) {
                        if (doc.seqVerlap > maxNumber) maxNumber = doc.seqVerlap;
                    } 
                    else if (doc.nomorBAVerlap) {
                        const match = doc.nomorBAVerlap.match(/\/(\d{3})\./);
                        if (match && match[1]) {
                            const num = parseInt(match[1], 10);
                            if (num > maxNumber) maxNumber = num;
                        }
                    }
                });

                currentSeq = maxNumber === 0 ? 1 : maxNumber + 2; 
            }

            // Fungsi generateNomor otomatis pakai 600.4.25 karena ada string 'BA.V'
            generatedNomorStr = generateNomor(currentSeq, tanggalVerifikasi, 'BA.V', existingData.jenisDokumen);
            
            updateQuery = { 
                nomorBAVerlap: generatedNomorStr, 
                tanggalVerlap: tanggalVerifikasi,
                seqVerlap: currentSeq, 
                status: 'Verifikasi Lapangan Selesai', 
                updatedAt: new Date()
            };
        }
        
        // ---------------------------------------------------------
        // TAHAP D (PEMERIKSAAN - BA.P) -> PREFIX 600.4.25
        // ---------------------------------------------------------
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = body;
            
            if (!tanggalPemeriksaan) {
                 return NextResponse.json({ success: false, message: 'Tanggal Pemeriksaan wajib diisi.' }, { status: 400 });
            }

            let currentSeq = existingData.seqPemeriksaan;

            if (!currentSeq) {
                const allDocs = await collection.find({ 
                    nomorBAPemeriksaan: { $exists: true, $ne: "" } 
                }).project({ nomorBAPemeriksaan: 1, seqPemeriksaan: 1 }).toArray();

                let maxNumber = 0;

                allDocs.forEach(doc => {
                    if (doc.seqPemeriksaan) {
                        if (doc.seqPemeriksaan > maxNumber) maxNumber = doc.seqPemeriksaan;
                    } 
                    else if (doc.nomorBAPemeriksaan) {
                        const match = doc.nomorBAPemeriksaan.match(/\/(\d+)\./);
                        if (match && match[1]) {
                            const num = parseInt(match[1], 10);
                            if (num > maxNumber) maxNumber = num;
                        }
                    }
                });

                currentSeq = maxNumber === 0 ? 2 : maxNumber + 2; 
            }

            // Fungsi generateNomor otomatis pakai 600.4.25 karena ada string 'BA.P'
            generatedNomorStr = existingData.nomorBAPemeriksaan || generateNomor(currentSeq, tanggalPemeriksaan, 'BA.P', existingData.jenisDokumen);
            
            updateQuery = { 
                nomorBAPemeriksaan: generatedNomorStr, 
                tanggalPemeriksaan: tanggalPemeriksaan,
                seqPemeriksaan: currentSeq 
            };
        }
        
        // --- TAHAP E (REVISI - BA.P.X) -> PREFIX 600.4.25 ---
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = body;
            const revisionMap: Record<string, string> = { '1': 'nomorRevisi1', '2': 'nomorRevisi2', '3': 'nomorRevisi3', '4': 'nomorRevisi4', '5': 'nomorRevisi5' };
            const dateMap: Record<string, string> = { '1': 'tanggalRevisi1', '2': 'tanggalRevisi2', '3': 'tanggalRevisi3', '4': 'tanggalRevisi4', '5': 'tanggalRevisi5' };

            const fieldNo = revisionMap[nomorRevisi];
            const fieldTgl = dateMap[nomorRevisi];
            
            if (!fieldNo || !fieldTgl) return NextResponse.json({ success: false, message: 'Nomor Revisi tidak valid.' }, { status: 400 });

            // Otomatis 600.4.25 karena mengandung 'BA.P'
            generatedNomorStr = generateNomor(queryNoUrut, tanggalRevisi, `BA.P.${nomorRevisi}`, existingData.jenisDokumen);
            updateQuery = { [fieldNo]: generatedNomorStr, [fieldTgl]: tanggalRevisi, statusTerakhir: 'REVISI' };
        }

        // --- TAHAP F (PHP) ---
        else if (tahap === 'f' || tahap === 'penerimaan') {
            const { tanggalPenyerahanPerbaikan, petugasPenerimaPerbaikan, nomorRevisi } = body;
            const phpFieldMap: Record<string, string> = { '1': 'nomorPHP', '2': 'nomorPHP1', '3': 'nomorPHP2', '4': 'nomorPHP3', '5': 'nomorPHP4' };
            const petugasFieldMap: Record<string, string> = { '1': 'petugasPenerimaPerbaikan', '2': 'petugasPHP1', '3': 'petugasPHP2', '4': 'petugasPHP3', '5': 'petugasPHP4' };
            const dateFieldMap: Record<string, string> = { '1': 'tanggalPHP', '2': 'tanggalPHP1', '3': 'tanggalPHP2', '4': 'tanggalPHP3', '5': 'tanggalPHP4' };

            const fieldNo = phpFieldMap[nomorRevisi];
            const fieldPetugas = petugasFieldMap[nomorRevisi];
            const fieldTgl = dateFieldMap[nomorRevisi];

            if (!fieldNo) return NextResponse.json({ success: false, message: 'Nomor Revisi PHP tidak valid.' }, { status: 400 });

            let kodeTahapan = 'PHP';
            if (nomorRevisi !== '1') kodeTahapan = `PHP.${parseInt(nomorRevisi) - 1}`;

            generatedNomorStr = generateNomor(queryNoUrut, tanggalPenyerahanPerbaikan, kodeTahapan, existingData.jenisDokumen);
            updateQuery = { [fieldNo]: generatedNomorStr, [fieldTgl]: tanggalPenyerahanPerbaikan, [fieldPetugas]: petugasPenerimaPerbaikan, statusTerakhir: 'DIPERIKSA', updatedAt: new Date() };
        }

        // --- TAHAP G ---
        else if (tahap === 'g') {
            const { tanggalPembuatanRisalah } = body;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalPembuatanRisalah, 'RPD', existingData.jenisDokumen);
            updateQuery = { tanggalRisalah: tanggalPembuatanRisalah, nomorRisalah: generatedNomorStr };
        }
        
        // --- TAHAP PENGEMBALIAN ---
        else if (tahap === 'pengembalian') {
            const { tanggalPengembalian } = body;
            if (!tanggalPengembalian) return NextResponse.json({ success: false, message: 'Tanggal Pengembalian wajib diisi.' }, { status: 400 });
            updateQuery = { tanggalPengembalian: tanggalPengembalian, statusTerakhir: 'DIKEMBALIKAN', updatedAt: new Date() };
        }
        
        else {
            return NextResponse.json({ success: false, message: 'Tahap tidak valid atau URL salah.' }, { status: 400 });
        }

        // EKSEKUSI UPDATE (BY _ID)
        const updateResult = await collection.updateOne({ _id: docId }, { $set: updateQuery });
        
        if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
             return NextResponse.json({ success: false, message: 'Gagal update data. Data mungkin tidak ditemukan.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Berhasil update data (Tahap: ${tahap.toUpperCase()}).`, 
            generatedNomor: generatedNomorStr 
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan internal pada server." }, { status: 500 });
    }
}