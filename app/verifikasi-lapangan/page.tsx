import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

interface DokumenPermohonan {
  _id: ObjectId;
  no_registrasi: string;
  pemrakarsa: string;
  kegiatan: string;
  status: string;
  nomor_sk?: string;
}

export default async function HalamanTabelVerifikasi() {
  const db = await getDb();

  // Ambil data (Menunggu Penomoran atau Selesai)
  const dataDokumen = await db.collection<DokumenPermohonan>('permohonan')
    .find({ status: { $in: ['MENUNGGU_PENOMORAN', 'SELESAI'] } })
    .sort({ _id: -1 }) // Terbaru di atas
    .limit(50)
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi & Penomoran</h1>
          <p className="text-gray-500 text-sm">Daftar antrian penerbitan SK Lingkungan.</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
               📚 Daftar Antrian
            </h3>
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">No. Registrasi</th>
                  <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">Status SK</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada antrian.</td></tr>
                ) : (
                  dataDokumen.map((doc) => (
                    <tr key={doc._id.toString()} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 align-top font-mono text-blue-600">
                        {doc.no_registrasi}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-gray-900">{doc.pemrakarsa}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{doc.kegiatan}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {doc.nomor_sk ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <CheckCircle size={14} /> Terbit: {doc.nomor_sk}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 text-xs font-bold animate-pulse">
                            <Clock size={14} /> Menunggu
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        {/* LINK INI SEKARANG MENGARAH KE /verifikasi/[ID] */}
                        <Link 
                          href={`/verifikasi/${doc._id.toString()}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition"
                        >
                          <BookOpen size={14} /> Proses
                        </Link>
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