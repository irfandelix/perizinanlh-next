import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { BookOpen, Clock, CheckCircle, Lock, AlertCircle } from 'lucide-react';

export default async function VerifikasiPage() {
  const db = await getDb();

  // --- DEBUGGING MODE: ON ---
  // Kita ambil SEMUA data tanpa filter status dulu
  // Biar ketahuan sebenarnya status dokumen kamu itu tulisannya apa.
  const dataDokumen = await db.collection('dokumen')
    .find({}) // <--- KOSONGKAN FILTERNYA
    .sort({ _id: -1 })
    .limit(50)
    .toArray();

  console.log("DATA DARI DB:", dataDokumen); // Cek terminal VSCode kamu nanti

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir (DEBUG MODE)</h1>
          <p className="text-red-500 text-sm font-bold">
            ⚠️ Menampilkan SEMUA dokumen tanpa filter. Cek kolom "Status Saat Ini".
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Pemrakarsa</th>
                  <th className="px-6 py-3">STATUS ASLI (DATABASE)</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                      Benar-benar kosong. Cek koneksi DB_NAME di .env kamu.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => (
                    <tr key={doc._id.toString()}>
                      <td className="px-6 py-4 font-bold">{doc.pemrakarsa}</td>
                      
                      {/* INI YANG PENTING: KITA LIHAT TEXT ASLINYA */}
                      <td className="px-6 py-4">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono border border-yellow-300">
                          {doc.status || "TIDAK ADA STATUS"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                         <Link href={`/verifikasi/${doc._id}`} className="text-blue-600 underline">Cek</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}