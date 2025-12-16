import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 

export async function POST(request: NextRequest) {
    try {
        // 1. Baca input dari Frontend
        const { keyword, noUrut } = await request.json(); 

        // VALIDASI BARU: Izinkan jika salah satu ada
        if (!keyword && !noUrut) {
            return NextResponse.json({ success: false, message: 'Parameter pencarian (keyword/noUrut) kosong.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('dokumen');

        let query = {};

        // 2. LOGIKA PENCARIAN
        if (noUrut) {
            // JIKA ADA NO URUT: Cari angka persis (Pastikan di-parse ke Integer)
            query = { noUrut: parseInt(noUrut) };
        } else {
            // JIKA HANYA KEYWORD: Cari menggunakan Regex (seperti kode lama Anda)
            query = {
                $or: [
                    { nomorChecklist: { $regex: keyword, $options: 'i' } },
                    { namaKegiatan: { $regex: keyword, $options: 'i' } },
                    { namaPemrakarsa: { $regex: keyword, $options: 'i' } },
                    { nomorSuratPermohonan: { $regex: keyword, $options: 'i' } }
                ]
            };
        }

        // 3. Eksekusi Pencarian
        const results = await collection.find(query).sort({ createdAt: -1 }).limit(10).toArray();

        if (results.length === 0) {
            return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: results 
        });

    } catch (error: any) {
        console.error("Search Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}