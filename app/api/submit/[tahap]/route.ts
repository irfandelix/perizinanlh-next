import { NextResponse, NextRequest } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/db';
import { ObjectId } from 'mongodb';

// --- DEFINISI TIPE ---
type Params = {
    tahap: string;
};

// --- 1. HELPER: FORMAT ANGKA 3 DIGIT ---
const formatToThreeDigits = (num: number) => num.toString().padStart(3, '0');

// --- 2. HELPER: AMBIL BULAN & TAHUN DARI STRING TANGGAL ---
const getDateParts = (dateString: string) => {
    if (!dateString) { 
        const now = new Date(); 
        return { month: now.getMonth() + 1, year: now.getFullYear() }; 
    }
    const parts = dateString.split('-'); // Format YYYY-MM-DD
    return { month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
};

// --- 3. HELPER: MAPPING JENIS DOKUMEN ---
const getKodeJenisDokumen = (inputJenis: string) => {
    if (!inputJenis) return 'DOK';
    const normalized = inputJenis.trim().toUpperCase();

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

    return map[normalized] || normalized;
};

// --- 4. HELPER UTAMA: GENERATE NOMOR SURAT ---
const generateNomor = (noUrut: number, dateString: string, tahapan: string, jenisDokumen: string) => {
    const { month, year } = getDateParts(dateString);
    const kodeJenis = getKodeJenisDokumen(jenisDokumen);
    const noUrutStr = formatToThreeDigits(noUrut);
    
    // Format: 600.4/[noUrut].[Bulan Input]/17/[Tahapan].[Jenis Dokumen]/[Tahun]
    return `600.4/${noUrutStr}.${month}/17/${tahapan}.${kodeJenis}/${year}`;
};


// ================= MAIN HANDLER =================

export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<Params> } // Correct context type for Next.js App Router
) {
    let generatedNomorStr: string = '';

    try {
        // Await params specifically for dynamic routes in newer Next.js versions
        const { tahap } = await params;
        const body = await request.json();
        
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection('dokumen'); 

        // ==========================================
        // TAHAP A (REGISTRASI AWAL)
        // ==========================================
        if (tahap === 'tahap-a') {
            // Ambil nomor urut terbaru
            const lastDoc = await collection.find().sort({ noUrut: -1 }).limit(1).toArray();
            const noUrut = lastDoc.length > 0 ? (lastDoc[0].noUrut || 0) + 1 : 1;
            
            const nomorChecklist = generateNomor(noUrut, body.tanggalMasukDokumen, 'REG', body.jenisDokumen);
            
            const newRecord = {
                ...body,
                noUrut,
                nomorChecklist,
                statusTerakhir: 'PROSES', // Status Awal
                createdAt: new Date(),
                // Inisialisasi field kosong untuk menjaga skema dokumen konsisten
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
        // LOGIKA UPDATE (UNTUK TAHAP SELANJUTNYA)
        // ==========================================
        
        const { noUrut } = body; 
        if (!noUrut) {
            return NextResponse.json({ success: false, message: 'No Urut tidak ditemukan di body request.' }, { status: 400 });
        }

        // Parse noUrut to integer for query
        const queryNoUrut = parseInt(noUrut);
        const existingData = await collection.findOne({ noUrut: queryNoUrut });
        
        if (!existingData) {
            return NextResponse.json({ success: false, message: `Data dengan No Urut ${queryNoUrut} tidak ditemukan.` }, { status: 404 });
        }

        let updateQuery: any = {};

        // --- TAHAP B: Uji Administrasi ---
        if (tahap === 'b') {
            const { tanggalPenerbitanUa } = body;
            if (existingData.nomorUjiBerkas) {
                generatedNomorStr = existingData.nomorUjiBerkas;
            } else {
                generatedNomorStr = generateNomor(queryNoUrut, tanggalPenerbitanUa, 'BA.HUA', existingData.jenisDokumen);
            }
            updateQuery = { nomorUjiBerkas: generatedNomorStr, tanggalUjiBerkas: tanggalPenerbitanUa };
        } 
        
        // --- TAHAP C: Verifikasi Lapangan ---
        else if (tahap === 'c') {
            const { tanggalVerifikasi } = body;
            if (existingData.nomorBAVerlap) {
                generatedNomorStr = existingData.nomorBAVerlap;
            } else {
                generatedNomorStr = generateNomor(queryNoUrut, tanggalVerifikasi, 'BA.V', existingData.jenisDokumen);
            }
            updateQuery = { nomorBAVerlap: generatedNomorStr, tanggalVerlap: tanggalVerifikasi };
        }
        
        // --- TAHAP D: Pemeriksaan Teknis ---
        else if (tahap === 'd') {
            const { tanggalPemeriksaan } = body;
            if (existingData.nomorBAPemeriksaan) {
                generatedNomorStr = existingData.nomorBAPemeriksaan;
            } else {
                generatedNomorStr = generateNomor(queryNoUrut, tanggalPemeriksaan, 'BA.P', existingData.jenisDokumen);
            }
            updateQuery = { nomorBAPemeriksaan: generatedNomorStr, tanggalPemeriksaan: tanggalPemeriksaan };
        }
        
        // --- TAHAP E: Revisi (Keluaran BA Revisi) ---
        else if (tahap === 'e') {
            const { tanggalRevisi, nomorRevisi } = body;

            const revisionMap: Record<string, string> = { 
                '1': 'nomorRevisi1', '2': 'nomorRevisi2', '3': 'nomorRevisi3', 
                '4': 'nomorRevisi4', '5': 'nomorRevisi5' 
            };
            const dateMap: Record<string, string> = {
                '1': 'tanggalRevisi1', '2': 'tanggalRevisi2', '3': 'tanggalRevisi3',
                '4': 'tanggalRevisi4', '5': 'tanggalRevisi5'
            };

            const fieldNo = revisionMap[nomorRevisi];
            const fieldTgl = dateMap[nomorRevisi];
            
            if (!fieldNo || !fieldTgl) {
                 return NextResponse.json({ success: false, message: 'Nomor Revisi tidak valid.' }, { status: 400 });
            }

            const tahapanCode = `BA.P.${nomorRevisi}`; 
            generatedNomorStr = generateNomor(queryNoUrut, tanggalRevisi, tahapanCode, existingData.jenisDokumen);
            
            updateQuery = { 
                [fieldNo]: generatedNomorStr, 
                [fieldTgl]: tanggalRevisi,
                statusTerakhir: 'REVISI' 
            };
        }

        // --- TAHAP F / PENERIMAAN: Penerimaan Hasil Perbaikan (PHP) ---
        else if (tahap === 'f' || tahap === 'penerimaan') {
            const { tanggalPenyerahanPerbaikan, petugasPenerimaPerbaikan, nomorRevisi } = body;
            
            const phpFieldMap: Record<string, string> = { 
                '1': 'nomorPHP', '2': 'nomorPHP1', '3': 'nomorPHP2', 
                '4': 'nomorPHP3', '5': 'nomorPHP4' 
            };
            const petugasFieldMap: Record<string, string> = {
                '1': 'petugasPenerimaPerbaikan', '2': 'petugasPHP1', '3': 'petugasPHP2',
                '4': 'petugasPHP3', '5': 'petugasPHP4'
            };
            const dateFieldMap: Record<string, string> = {
                '1': 'tanggalPHP', '2': 'tanggalPHP1', '3': 'tanggalPHP2',
                '4': 'tanggalPHP3', '5': 'tanggalPHP4'
            };

            const fieldNo = phpFieldMap[nomorRevisi];
            const fieldPetugas = petugasFieldMap[nomorRevisi];
            const fieldTgl = dateFieldMap[nomorRevisi];

             if (!fieldNo) {
                 return NextResponse.json({ success: false, message: 'Nomor Revisi PHP tidak valid.' }, { status: 400 });
            }

            let kodeTahapan = 'PHP';
            if (nomorRevisi !== '1') {
                // PHP pertama biasanya 'PHP', selanjutnya PHP.1, PHP.2, dst.
                // Logika ini bisa disesuaikan dengan kebutuhan DLH
                const index = parseInt(nomorRevisi) - 1;
                kodeTahapan = `PHP.${index}`;
            }

            generatedNomorStr = generateNomor(queryNoUrut, tanggalPenyerahanPerbaikan, kodeTahapan, existingData.jenisDokumen);
            
            updateQuery = { 
                [fieldNo]: generatedNomorStr, 
                [fieldTgl]: tanggalPenyerahanPerbaikan, 
                [fieldPetugas]: petugasPenerimaPerbaikan,
                statusTerakhir: 'DIPERIKSA', 
                updatedAt: new Date()
            };
        }

        // --- TAHAP G: Risalah RPD ---
        else if (tahap === 'g') {
            const { tanggalPembuatanRisalah } = body;
            generatedNomorStr = generateNomor(queryNoUrut, tanggalPembuatanRisalah, 'RPD', existingData.jenisDokumen);
            updateQuery = { tanggalRisalah: tanggalPembuatanRisalah, nomorRisalah: generatedNomorStr };
        }
        
        // --- TAHAP PENGEMBALIAN (RETURN TO PEMRAKARSA) ---
        else if (tahap === 'pengembalian') {
            const { tanggalPengembalian } = body;

            if (!tanggalPengembalian) {
                return NextResponse.json({ success: false, message: 'Tanggal Pengembalian wajib diisi.' }, { status: 400 });
            }

            updateQuery = { 
                tanggalPengembalian: tanggalPengembalian,
                statusTerakhir: 'DIKEMBALIKAN', 
                updatedAt: new Date()
            };
        }
        
        // --- JIKA TAHAP TIDAK DIKENALI ---
        else {
            return NextResponse.json({ success: false, message: 'Tahap tidak valid atau URL salah.' }, { status: 400 });
        }

        // ==========================================
        // EKSEKUSI UPDATE KE DATABASE
        // ==========================================
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