import { NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection('dokumen');

    // Filter berdasarkan tahun (menggunakan createdAt)
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const summary = await collection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$jenisDokumen", // Group berdasarkan jenis (misal: SPPL, UKLUPL, PERTEK.AL)
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}