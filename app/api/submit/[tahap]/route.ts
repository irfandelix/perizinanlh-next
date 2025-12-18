import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 

// --- DEFINISI TIPE ---
// Sesuai nama folder [tahap]
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

const getKodeJenisDokumen = (inputJenis: string) => {
    if (!inputJenis) return 'DOK';
    const normalized = inputJenis.trim().toUpperCase();

    // Mapping sesuai opsi di Frontend
    const map: Record<string, string> = {
        'SPPL': 'SPPL', 
        'UKLUPL': 'UKLUPL', 
        'UKL-UPL': 'UKLUPL',
        'RINTEK LB3': 'RINTEK.LB3', 
        'PERTEK AIR LIMBAH': 'PERTEK.AL',
        'PERTEK EMISI': 'PERTEK.EM', 
        'SLO': 'SLO', 
        'DPLH': 'DPLH',
        'DELH': 'DELH', 
        'AMDAL': 'AMDAL'
    };

    // Jika tidak ada di map, gunakan string aslinya
    return map[normalized] || normalized;
};

// Pastikan fungsi generateNomor menerima angka (number) apa saja
const generateNomor = (nomorUntukSurat: number, dateString: string, tahapan: string, jenisDokumen: string) => {
    const { month, year } = getDateParts(dateString);
    const kodeJenis = getKodeJenisDokumen(jenisDokumen);
    // Kita gunakan nomor hasil kalkulasi ganjil/genap disini
    const noUrutStr = formatToThreeDigits(nomorUntukSurat); 
    return `600.4/${noUrutStr}.${month}/17/${tahapan}.${kodeJenis}/${year}`;
};

// ================= MAIN HANDLER =================

export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<Params> } 
) {
    let generatedNomorStr: string = '';

    try {
        // MENANGKAP VARIABEL DARI NAMA FOLDER [tahap]
        const { tahap } = await params;
        
        // 1. AMBIL RAW BODY & FLATTENING DATA
        const rawBody = await request.json();
        let body = rawBody;

        // Cek jika data terbungkus dalam 'formData', kita keluarkan isinya
        if (rawBody.formData) {
            body = {
                ...rawBody.formData,      
                ...rawBody,               
            };
            delete body.formData;         
        }

        console.log(`[API] Processing Tahap: ${tahap}`);

        const client = await clientPromise;
        const db = client.db(); // Default DB dari URI
        const collection = db.collection('dokumen'); 

        // ==========================================
        // TAHAP A (REGISTRASI AWAL)
        // ==========================================
        if (tahap === 'tahap-a') {
            const lastDoc = await collection.find().sort({ noUrut: -1 }).limit(1).toArray();
            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            
            const nomorChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            const newRecord = {
                ...body,
                noUrut, 
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
                message: 'Registrasi Berhasil!', 
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
        const existingData = await collection.findOne({ noUrut: queryNoUrut });
        
        if (!existingData) {
            return NextResponse.json({ success: false, message: `Data dengan No Urut ${queryNoUrut} tidak ditemukan.` }, { status: 404 });
        }

        let updateQuery: any = {};

        // --- TAHAP B ---
        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = body;
            generatedNomorStr = existingData.nomorUjiBerkas || generateNomor(queryNoUrut, tanggalPenerbitanUa, 'BA.HUA', existingData.jenisDokumen);
            updateQuery = { nomorUjiBerkas: generatedNomorStr, tanggalUjiBerkas: tanggalPenerbitanUa };
        } 
        
        // ---------------------------------------------------------
        // TAHAP C (VERIFIKASI LAPANGAN) -> GANJIL (1, 3, 5...)
        // ---------------------------------------------------------
        else if (tahap === 'c' || tahap === 'verlap') {
            const tanggalVerifikasi = body.tanggalVerifikasi || body.tanggalVerlap;
            if (!tanggalVerifikasi) return NextResponse.json({ success: false, message: 'Tanggal Verifikasi wajib diisi.' }, { status: 400 });

            // 1. Cek apakah dokumen ini SUDAH punya seqVerlap (Data Baru)
            let currentSeq = existingData.seqVerlap; 

            if (!currentSeq) {
                // 2. Jika belum, kita cari angka TERBESAR dari seluruh database
                // Kita ambil semua dokumen yang sudah punya Nomor BA Verlap
                const allDocs = await collection.find({ 
                    nomorBAVerlap: { $exists: true, $ne: "" } 
                }).project({ nomorBAVerlap: 1, seqVerlap: 1 }).toArray();

                let maxNumber = 0;

                allDocs.forEach(doc => {
                    // Prioritas 1: Gunakan seqVerlap jika ada
                    if (doc.seqVerlap) {
                        if (doc.seqVerlap > maxNumber) maxNumber = doc.seqVerlap;
                    } 
                    // Prioritas 2: Parsing String Manual (Untuk data lama: 161, 129, dll)
                    else if (doc.nomorBAVerlap) {
                        // Regex: Cari tanda '/' diikuti 3 digit angka, diikuti tanda '.'
                        // Cocok untuk: .../161.10... atau .../129.12...
                        const match = doc.nomorBAVerlap.match(/\/(\d{3})\./);
                        if (match && match[1]) {
                            const num = parseInt(match[1], 10);
                            if (num > maxNumber) maxNumber = num;
                        }
                    }
                });

                // Angka terakhir ketemu (misal 161). 
                // Kita tambah 2 -> Jadi 163.
                // Jika database kosong (maxNumber 0), mulai dari 1.
                currentSeq = maxNumber === 0 ? 1 : maxNumber + 2;
            }

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
        // TAHAP D (PEMERIKSAAN) -> GENAP (2, 4, 6...)
        // ---------------------------------------------------------
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = body;
            
            if (!tanggalPemeriksaan) {
                 return NextResponse.json({ success: false, message: 'Tanggal Pemeriksaan wajib diisi.' }, { status: 400 });
            }

            // 1. Cek apakah dokumen ini SUDAH punya seqPemeriksaan?
            let currentSeq = existingData.seqPemeriksaan;

            if (!currentSeq) {
                // 2. Jika belum, kita cari angka TERBESAR dari seluruh database (Scan Manual)
                // Ambil semua dokumen yang sudah punya Nomor BA Pemeriksaan
                const allDocs = await collection.find({ 
                    nomorBAPemeriksaan: { $exists: true, $ne: "" } 
                }).project({ nomorBAPemeriksaan: 1, seqPemeriksaan: 1 }).toArray();

                let maxNumber = 0;

                allDocs.forEach(doc => {
                    // Prioritas 1: Gunakan seqPemeriksaan jika ada (Data Baru)
                    if (doc.seqPemeriksaan) {
                        if (doc.seqPemeriksaan > maxNumber) maxNumber = doc.seqPemeriksaan;
                    } 
                    // Prioritas 2: Parsing String Manual (Untuk data lama seperti 162)
                    else if (doc.nomorBAPemeriksaan) {
                        // Regex: Cari tanda '/' diikuti angka, diikuti tanda '.'
                        // Contoh: .../162.10... akan mengambil angka 162
                        const match = doc.nomorBAPemeriksaan.match(/\/(\d+)\./);
                        if (match && match[1]) {
                            const num = parseInt(match[1], 10);
                            if (num > maxNumber) maxNumber = num;
                        }
                    }
                });

                // Kalkulasi: Ambil yang terbesar (162), tambah 2 -> Jadi 164
                // Jika database kosong, mulai dari 2.
                currentSeq = maxNumber === 0 ? 2 : maxNumber + 2;
            }

            // Generate Nomor Baru
            generatedNomorStr = existingData.nomorBAPemeriksaan || generateNomor(currentSeq, tanggalPemeriksaan, 'BA.P', existingData.jenisDokumen);
            
            updateQuery = { 
                nomorBAPemeriksaan: generatedNomorStr, 
                tanggalPemeriksaan: tanggalPemeriksaan,
                seqPemeriksaan: currentSeq // Simpan urutannya
            };
        }
        
        // --- TAHAP E (REVISI) ---
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = body;
            const revisionMap: Record<string, string> = { '1': 'nomorRevisi1', '2': 'nomorRevisi2', '3': 'nomorRevisi3', '4': 'nomorRevisi4', '5': 'nomorRevisi5' };
            const dateMap: Record<string, string> = { '1': 'tanggalRevisi1', '2': 'tanggalRevisi2', '3': 'tanggalRevisi3', '4': 'tanggalRevisi4', '5': 'tanggalRevisi5' };

            const fieldNo = revisionMap[nomorRevisi];
            const fieldTgl = dateMap[nomorRevisi];
            
            if (!fieldNo || !fieldTgl) return NextResponse.json({ success: false, message: 'Nomor Revisi tidak valid.' }, { status: 400 });

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

        // EKSEKUSI UPDATE
        const updateResult = await collection.updateOne({ noUrut: queryNoUrut }, { $set: updateQuery });
        
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