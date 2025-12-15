import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/db'; 

export async function POST(request: NextRequest) {
    try {
        // 1. Baca keyword pencarian dari Frontend
        const { keyword } = await request.json();

        if (!keyword) {
            return NextResponse.json({ success: false, message: 'Keyword tidak boleh kosong' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('dokumen');

        // 2. Buat Query Pencarian (Regex = Like %keyword%)
        // Mencari di Nomor Checklist, Nama Kegiatan, atau Nama Pemrakarsa (Case Insensitive 'i')
        const query = {
            $or: [
                { nomorChecklist: { $regex: keyword, $options: 'i' } },
                { namaKegiatan: { $regex: keyword, $options: 'i' } },
                { namaPemrakarsa: { $regex: keyword, $options: 'i' } },
                { nomorSuratPermohonan: { $regex: keyword, $options: 'i' } }
            ]
        };

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