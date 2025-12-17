import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, Calendar, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // --- QUERY PENTING ---
  // Kita ambil dokumen yang statusnya:
  // 1. MENUNGGU_VERIFIKASI_LAPANGAN (Baru Lulus Uji Admin)
  // 2. SEDANG_VERIFIKASI_LAPANGAN (Sedang Proses)
  // 3. SELESAI_VERIFIKASI_LAPANGAN (Sudah Selesai Lapangan)
  // 4. Tahap-tahap selanjutnya (Substansi, Risalah, dll) agar tetap terlihat history-nya
  const dataDokumen = await db.collection('dokumen')
    .find({ 
        status: { 
          $in: [
            'MENUNGGU_VERIFIKASI_LAPANGAN', 
            'SEDANG_VERIFIKASI_LAPANGAN',
            'SELESAI_VERIFIKASI_LAPANGAN',
            'MENUNGGU_PEMERIKSAAN_SUBSTANSI',
            'MENUNGGU_VERIFIKASI_PERBAIKAN',
            'MENUNGGU_VERIFIKASI_AKHIR',
            'SIAP_PENOMORAN',
            'SELESAI'
          ] 
        } 
    })
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Monitoring jadwal dan hasil kunjungan lapangan (Lulus Uji Admin).</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
               <MapPin size={18} /> Daftar Kunjungan Lapangan
            </h3>
            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Pemrakarsa / No. Reg</th>
                  <th className="px-6 py-3">Lokasi & Kegiatan</th>
                  <th className="px-6 py-3">Status Lapangan</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      <p>Belum ada dokumen yang masuk tahap ini.</p>
                      <p className="text-xs mt-1">(Pastikan dokumen sudah di-ACC di menu Uji Administrasi)</p>
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    
                    // Logic Tampilan Status
                    const isBaruMasuk = doc.status === 'MENUNGGU_VERIFIKASI_LAPANGAN';
                    const isProses = doc.status === 'SEDANG_VERIFIKASI_LAPANGAN';
                    // Status setelah lapangan dianggap selesai
                    const isSelesai = !isBaruMasuk && !isProses; 

                    return (
                      <tr key={doc._id.toString()} className={`transition-colors ${isSelesai ? 'bg-gray-50/50' : 'hover:bg-green-50/30'}`}>
                        
                        {/* Kolom 1: Identitas */}
                        <td className="px-6 py-4 align-top">
                          <div className={`font-bold ${isSelesai ? 'text-gray-600' : 'text-gray-900'}`}>
                            {doc.pemrakarsa}
                          </div>
                          <div className="text-xs text-green-600 font-mono mt-1 bg-green-50 px-1 py-0.5 rounded w-fit">
                            {doc.no_registrasi}
                          </div>
                        </td>

                        {/* Kolom 2: Lokasi */}
                        <td className="px-6 py-4 align-top">
                          <div className="text-gray-700 mb-1">{doc.kegiatan}</div>
                          <div className="text-xs text-gray-500 flex items-start gap-1">
                              <MapPin size={12} className="mt-0.5 shrink-0" /> 
                              {doc.lokasi_usaha || "Lokasi belum diinput"}
                          </div>
                        </td>

                        {/* Kolom 3: Status */}
                        <td className="px-6 py-4 align-top">
                           {isBaruMasuk && (
                              <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-200 animate-pulse">
                                 <AlertCircle size={12} /> Perlu Jadwal
                              </span>
                           )}
                           {isProses && (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                 <Clock size={12} /> Sedang Berjalan
                              </span>
                           )}
                           {isSelesai && (
                              <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                 <CheckCircle size={12} /> Selesai
                              </span>
                           )}
                           
                           {/* Info Status Asli DB */}
                           <div className="text-[10px] text-gray-400 mt-1 uppercase">
                              {doc.status.replace(/_/g, ' ')}
                           </div>
                        </td>

                        {/* Kolom 4: Aksi */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                isSelesai 
                                ? 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {isSelesai ? (
                                <>Detail <ArrowRight size={12} /></>
                            ) : (
                                <><Calendar size={12} /> {isBaruMasuk ? 'Atur Jadwal' : 'Input Hasil'}</>
                            )}
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