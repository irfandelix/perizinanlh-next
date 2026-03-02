import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; 

// Agar data selalu fresh (tidak di-cache statis oleh Vercel/Next.js)
export const dynamic = 'force-dynamic'; 

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        
        // PERBAIKAN: Ambil semua dokumen tanpa membatasi kolom (.project dihapus)
        // Agar semua variabel tanggal (tanggalPemeriksaan, tanggalVerlap, dll) terkirim ke Dashboard
        const documents = await db.collection('dokumen')
            .find({})
            .sort({ noUrut: -1 }) // Urutkan berdasarkan nomor urut terbaru
            .limit(500) // Naikkan limit sedikit agar data tahunan tertampung semua
            .toArray();

        return NextResponse.json({ success: true, data: documents });

    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}