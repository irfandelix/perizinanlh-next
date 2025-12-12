import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; // Cukup import clientPromise saja

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('dokumen');

    // Define Date Range for the selected year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Base filter: Documents created in that year
    const yearFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Parallel Count Queries for efficiency
    const [
      totalMasuk,
      totalUjiAdmin,
      totalVerlap,
      totalPemeriksaan,
      totalPerbaikan, // Ini PHP (Penerimaan Hasil Perbaikan)
      totalRPD
    ] = await Promise.all([
      // 1. Total Masuk (Semua dokumen tahun itu)
      collection.countDocuments(yearFilter),
      
      // 2. Total Uji Admin (Yg punya nomorUjiBerkas)
      collection.countDocuments({ ...yearFilter, nomorUjiBerkas: { $ne: "" } }),
      
      // 3. Total Verlap (Yg punya nomorBAVerlap)
      collection.countDocuments({ ...yearFilter, nomorBAVerlap: { $ne: "" } }),
      
      // 4. Total Pemeriksaan (Yg punya nomorBAPemeriksaan)
      collection.countDocuments({ ...yearFilter, nomorBAPemeriksaan: { $ne: "" } }),

      // 5. Total Perbaikan/PHP (Yg punya nomorPHP)
      collection.countDocuments({ ...yearFilter, nomorPHP: { $ne: "" } }),

      // 6. Total Risalah/RPD (Yg punya nomorRisalah)
      collection.countDocuments({ ...yearFilter, nomorRisalah: { $ne: "" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalMasuk,
        totalUjiAdmin,
        totalVerlap,
        totalPemeriksaan,
        totalPerbaikan,
        totalRPD
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}