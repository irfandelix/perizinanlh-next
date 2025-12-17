import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

// Interface sesuai struktur DB
interface DokumenPermohonan {
  _id: ObjectId;
  no_registrasi: string;
  pemrakarsa: string;
  kegiatan: string;
  status: string;
  nomor_sk?: string; // Output bisa ada bisa tidak (tergantung status)
}

export default async function VerifikasiPage() {
  const db = await getDb();

  // 1. Ambil Data (Server Side Fetching)
  // Menampilkan dokumen yang statusnya relevan untuk verifikasi akhir / penomoran
  const dataDokumen = await db.collection<DokumenPermohonan>('permohonan')
    .find({ 
        // Sesuaikan status ini dengan workflow Anda. 
        // Jika tahap ini adalah "Risalah" sebelum arsip, mungkin statusnya 'MENUNGGU_VERIFIKASI_AKHIR'
        // Jika ini tahap penomoran, gunakan 'MENUNGGU_PENOMORAN'
        status: { $in: ['MENUNGGU_PENOMORAN', 'SIAP_PENOMORAN', 'SELESAI'] } 
    })
    .sort({ _id: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi & Penomoran Akhir</h1>
          <p className="text-gray-500 text-sm">Validasi akhir dokumen sebelum diterbitkan SK/PKPLH.</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          
          {/* Card Header (Warna Biru) */}
          <div className="p-4 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
               📚 Daftar Antrian
            </h3>
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">No. Registrasi</th>
                  <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">Nomor SK</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Belum ada dokumen siap diproses.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc) => (
                    <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                      
                      {/* Kolom 1: No Registrasi */}
                      <td className="px-6 py-4 font-mono font-medium text-blue-600 align-top">
                        {doc.no_registrasi}
                        <div className="text-xs text-gray-400 mt-1">Jenis: UKL-UPL</div>
                      </td>

                      {/* Kolom 2: Pemrakarsa */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-gray-800">{doc.pemrakarsa}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                          {doc.kegiatan}
                        </div>
                      </td>

                      {/* Kolom 3: Output (Nomor SK) */}
                      <td className="px-6 py-4 align-top">
                        {doc.nomor_sk ? (
                          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            <span className="font-mono text-xs font-bold">{doc.nomor_sk}</span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 text-xs font-bold animate-pulse">
                            <Clock className="w-3 h-3" /> Belum Terbit
                          </span>
                        )}
                      </td>

                      {/* Kolom 4: Status */}
                      <td className="px-6 py-4 align-top">
                        {doc.nomor_sk ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <CheckCircle className="w-3 h-3" /> Selesai
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-500 text-xs font-bold">
                            <Clock className="w-3 h-3" /> Proses Risalah
                          </span>
                        )}
                      </td>

                      {/* Kolom 5: Aksi (Tombol Biru) */}
                      <td className="px-6 py-4 text-center align-top">
                        <Link 
                          // Perubahan di sini: Link ke /verifikasi/[id]
                          href={`/verifikasi/${doc._id.toString()}`}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                             doc.nomor_sk
                             ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                             : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <BookOpen className="w-3 h-3" /> 
                          {doc.nomor_sk ? 'Detail' : 'Proses'}
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