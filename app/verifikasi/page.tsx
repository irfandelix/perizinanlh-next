import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

interface DokumenPermohonan {
  _id: ObjectId;
  no_registrasi: string;
  pemrakarsa: string;
  kegiatan: string;
  status: string;
}

export default async function VerifikasiPage() {
  const db = await getDb();

  // Ambil dokumen yang siap untuk Diverifikasi Akhir / Risalah
  const dataDokumen = await db.collection<DokumenPermohonan>('permohonan')
    .find({ 
        // Filter status yang relevan.
        // Biasanya dokumen masuk ke sini setelah perbaikan selesai (misal: MENUNGGU_VERIFIKASI_AKHIR)
        // Dan keluar dari sini dengan status SIAP_PENOMORAN
        status: { $in: ['MENUNGGU_VERIFIKASI_AKHIR', 'MENUNGGU_PENOMORAN', 'SIAP_PENOMORAN'] } 
    })
    .sort({ _id: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir (Risalah)</h1>
          <p className="text-gray-500 text-sm">Validasi dokumen pasca perbaikan sebelum diteruskan ke Pengarsipan.</p>
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
                  <th className="px-6 py-3">Status Dokumen</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Tidak ada dokumen yang perlu diverifikasi.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc) => {
                    // Cek apakah sudah diverifikasi (Siap Penomoran)
                    const isSelesai = doc.status === 'SIAP_PENOMORAN' || doc.status === 'SELESAI';

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. No Registrasi */}
                        <td className="px-6 py-4 font-mono font-medium text-blue-600 align-top">
                          {doc.no_registrasi}
                          <div className="text-xs text-gray-400 mt-1">Jenis: UKL-UPL</div>
                        </td>

                        {/* 2. Pemrakarsa */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800">{doc.pemrakarsa}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                            {doc.kegiatan}
                          </div>
                        </td>

                        {/* 3. Status (Tanpa Nomor SK) */}
                        <td className="px-6 py-4 align-top">
                          {isSelesai ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit border border-green-200">
                              <CheckCircle className="w-3 h-3" /> Siap Penomoran
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded w-fit border border-orange-200 animate-pulse">
                              <Clock className="w-3 h-3" /> Perlu Verifikasi
                            </span>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1 uppercase">
                            Posisi: {doc.status.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* 4. Aksi */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                               isSelesai
                               ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                               : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <BookOpen className="w-3 h-3" /> 
                            {isSelesai ? 'Lihat Detail' : 'Proses Risalah'}
                          </Link>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}