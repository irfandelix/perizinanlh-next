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
        
        // --- TAHAP C (VERIFIKASI LAPANGAN) ---
        else if (tahap === 'c' || tahap === 'verlap') {
            const tanggalVerifikasi = body.tanggalVerifikasi || body.tanggalVerlap;

            if (!tanggalVerifikasi) {
                 return NextResponse.json({ success: false, message: 'Tanggal Verifikasi wajib diisi.' }, { status: 400 });
            }

            let currentSeq = existingData.seqVerlap;

            if (!currentSeq) {
                // 1. Coba cari yang punya label seqVerlap (Data Baru)
                const lastVerlapDoc = await collection.find({ seqVerlap: { $exists: true } })
                                                      .sort({ seqVerlap: -1 })
                                                      .limit(1)
                                                      .toArray();
                
                if (lastVerlapDoc.length > 0) {
                    currentSeq = lastVerlapDoc[0].seqVerlap + 2;
                } else {
                    // 2. FALLBACK: Jika tidak ada label, CARI STRING TERAKHIR (Data Lama)
                    // Ambil dokumen dengan nomorBAVerlap terisi, urutkan dari yang terbaru dibuat (createdAt atau _id)
                    const lastManualDoc = await collection.find({ nomorBAVerlap: { $exists: true, $ne: "" } })
                                                          .sort({ _id: -1 }) 
                                                          .limit(1)
                                                          .toArray();

                    if (lastManualDoc.length > 0) {
                        // String: "600.4/129.12/17/BA.V.UKLUPL/2025"
                        // Kita ambil angka "129"-nya
                        try {
                            const nomorStr = lastManualDoc[0].nomorBAVerlap;
                            // Split berdasarkan '/' -> ambil bagian kedua "129.12"
                            const parts = nomorStr.split('/'); 
                            if (parts.length > 1) {
                                // Split berdasarkan '.' -> ambil bagian pertama "129"
                                const numberPart = parts[1].split('.')[0];
                                const lastNumber = parseInt(numberPart, 10);
                                
                                if (!isNaN(lastNumber)) {
                                    currentSeq = lastNumber + 2; // Lanjutkan urutan lama (129 + 2 = 131)
                                }
                            }
                        } catch (e) {
                            console.log("Gagal parsing nomor lama, reset ke 1");
                        }
                    }
                }

                // 3. Jika benar-benar kosong (DB Baru), mulai dari 1
                if (!currentSeq) currentSeq = 1;
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
        
        // --- TAHAP D (PEMERIKSAAN) ---
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = body;
            
            // Logika SAMA untuk Pemeriksaan (Genap)
            let currentSeq = existingData.seqPemeriksaan;

            if (!currentSeq) {
                // 1. Cari data baru (seqPemeriksaan)
                const lastPemeriksaanDoc = await collection.find({ seqPemeriksaan: { $exists: true } })
                                                           .sort({ seqPemeriksaan: -1 })
                                                           .limit(1)
                                                           .toArray();

                if (lastPemeriksaanDoc.length > 0) {
                    currentSeq = lastPemeriksaanDoc[0].seqPemeriksaan + 2;
                } else {
                    // 2. Fallback baca string data lama
                     const lastManualDoc = await collection.find({ nomorBAPemeriksaan: { $exists: true, $ne: "" } })
                                                          .sort({ _id: -1 }) 
                                                          .limit(1)
                                                          .toArray();
                    
                     if (lastManualDoc.length > 0) {
                        try {
                            const nomorStr = lastManualDoc[0].nomorBAPemeriksaan;
                            const parts = nomorStr.split('/'); 
                            if (parts.length > 1) {
                                const numberPart = parts[1].split('.')[0];
                                const lastNumber = parseInt(numberPart, 10);
                                if (!isNaN(lastNumber)) {
                                    currentSeq = lastNumber + 2; 
                                }
                            }
                        } catch (e) {}
                    }
                }
                
                // 3. Jika kosong, mulai dari 2 (Genap)
                if (!currentSeq) currentSeq = 2;
            }

            generatedNomorStr = existingData.nomorBAPemeriksaan || generateNomor(currentSeq, tanggalPemeriksaan, 'BA.P', existingData.jenisDokumen);
            
            updateQuery = { 
                nomorBAPemeriksaan: generatedNomorStr, 
                tanggalPemeriksaan: tanggalPemeriksaan,
                seqPemeriksaan: currentSeq 
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