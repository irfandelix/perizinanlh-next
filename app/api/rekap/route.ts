import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; // Cukup import clientPromise saja

export const dynamic = 'force-dynamic'; // Agar data selalu fresh (tidak dicache)

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('dokumen'); // Pastikan nama collection 'dokumen' atau 'records'

    // Ambil semua data, urutkan berdasarkan noUrut
    const data = await collection.find({}).sort({ noUrut: 1 }).toArray();

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}