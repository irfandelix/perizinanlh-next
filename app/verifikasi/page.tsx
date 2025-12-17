import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { BookOpen, Clock, CheckCircle, Lock, AlertCircle } from 'lucide-react';

interface DokumenPermohonan {
  _id: ObjectId;
  no_registrasi: string;
  pemrakarsa: string;
  kegiatan: string;
  status: string;
}

export default async function VerifikasiPage() {
  const db = await getDb();

  // 1. QUERY DIPERLUAS
  // Kita ambil dokumen dari tahap sebelumnya juga (misal: tahap perbaikan/validasi teknis)
  // tujuannya agar admin tau "oh, ada dokumen yang bakal masuk nih"
  const dataDokumen = await db.collection<DokumenPermohonan>('permohonan')
    .find({ 
        status: { 
          $in: [
            'MENUNGGU_VERIFIKASI_PERBAIKAN', // Masih di Tahap F (Locked)
            'SEDANG_VALIDASI_TEKNIS',        // Masih di Tim Teknis (Locked)
            'MENUNGGU_VERIFIKASI_AKHIR',     // SUDAH SAMPAI (Unlocked)
            'SIAP_PENOMORAN',                // Selesai (Detail)
            'SELESAI'
          ] 
        } 
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
               📚 Daftar Monitoring & Antrian
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
                  <th className="px-6 py-3">Status Saat Ini</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Tidak ada data dokumen.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc) => {
                    // --- LOGIKA STATUS ---
                    
                    // 1. Ready (Bisa diklik)
                    const isReady = doc.status === 'MENUNGGU_VERIFIKASI_AKHIR';
                    
                    // 2. Selesai (Sudah lewat tahap ini)
                    const isDone = doc.status === 'SIAP_PENOMORAN' || doc.status === 'SELESAI';
                    
                    // 3. Locked (Masih di tahap sebelumnya)
                    const isLocked = !isReady && !isDone;

                    return (
                      <tr 
                        key={doc._id.toString()} 
                        className={`transition-colors ${isLocked ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}
                      >
                        
                        {/* 1. No Registrasi */}
                        <td className="px-6 py-4 font-mono font-medium align-top">
                          <span className={isLocked ? 'text-gray-400' : 'text-blue-600'}>
                            {doc.no_registrasi}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">Jenis: UKL-UPL</div>
                        </td>

                        {/* 2. Pemrakarsa */}
                        <td className="px-6 py-4 align-top">
                          <div className={`font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                            {doc.pemrakarsa}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                            {doc.kegiatan}
                          </div>
                        </td>

                        {/* 3. Status Display */}
                        <td className="px-6 py-4 align-top">
                          {isReady && (
                             <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded w-fit border border-blue-200 animate-pulse">
                                <Clock className="w-3 h-3" /> Siap Verifikasi
                             </span>
                          )}

                          {isDone && (
                             <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit border border-green-200">
                                <CheckCircle className="w-3 h-3" /> Selesai
                             </span>
                          )}

                          {isLocked && (
                             <span className="flex items-center gap-1 text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                                <AlertCircle className="w-3 h-3" /> Menunggu Tahap F
                             </span>
                          )}

                          <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                            {doc.status.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* 4. Aksi (Button Logic) */}
                        <td className="px-6 py-4 text-center align-top">
                          
                          {isLocked ? (
                            // JIKA TERKUNCI (Belum sampai tahap ini)
                            <button 
                              disabled
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                              title="Dokumen belum sampai di tahap ini"
                            >
                              <Lock className="w-3 h-3" /> Terkunci
                            </button>
                          ) : (
                            // JIKA READY ATAU SELESAI
                            <Link 
                              href={`/verifikasi/${doc._id.toString()}`}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                 isDone
                                 ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                                 : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              <BookOpen className="w-3 h-3" /> 
                              {isDone ? 'Lihat' : 'Proses'}
                            </Link>
                          )}
                          
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