import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; 

// Agar data selalu fresh (tidak di-cache statis oleh Vercel/Next.js)
export const dynamic = 'force-dynamic'; 

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        
        // Ambil semua dokumen, urutkan dari yang terbaru (createdAt desc)
        // Limit 100 agar tidak terlalu berat jika data sudah ribuan
        const documents = await db.collection('dokumen')
            .find({})
            .project({
                noUrut: 1, // <--- TAMBAHKAN INI (PENTING!)
                nomorChecklist: 1, 
                namaPemrakarsa: 1, 
                namaKegiatan: 1, 
                tanggalMasukDokumen: 1,
                statusVerifikasi: 1, 
                statusTerakhir: 1,   
                jenisDokumen: 1,
                nomorUjiBerkas: 1, // <--- TAMBAHKAN INI
                createdAt: 1
            })
            .sort({ createdAt: -1 }) 
            .limit(100)
            .toArray();

        return NextResponse.json({ success: true, data: documents });

    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}