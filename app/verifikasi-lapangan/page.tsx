import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, Calendar, CheckCircle, Clock, AlertCircle, ArrowRight, FileQuestion } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // --- QUERY: AMBIL SEMUA (NO FILTER) ---
  // Kita hapus bagian filter { status: ... } agar semua data muncul
  const dataDokumen = await db.collection('dokumen')
    .find({}) // KOSONG = SELECT ALL
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan (Semua Data)</h1>
          <p className="text-gray-500 text-sm">Menampilkan seluruh isi database dokumen untuk monitoring.</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
               <MapPin size={18} /> Total Data Database
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
                  <th className="px-6 py-3">Status Saat Ini</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      <p className="font-bold">DATABASE KOSONG</p>
                      <p className="text-xs">Cek koneksi atau pastikan collection 'dokumen' ada isinya.</p>
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    
                    // --- LOGIKA VISUALISASI STATUS ---
                    const status = doc.status || "TANPA_STATUS";
                    
                    // Cek apakah ini tahapan lapangan?
                    const isTahapLapangan = [
                        'MENUNGGU_VERIFIKASI_LAPANGAN', 
                        'SEDANG_VERIFIKASI_LAPANGAN',
                        'SELESAI_VERIFIKASI_LAPANGAN'
                    ].includes(status);

                    // Cek apakah sudah lewat (tahap lanjut)?
                    const isSudahLewat = [
                        'MENUNGGU_PEMERIKSAAN_SUBSTANSI', 'MENUNGGU_VERIFIKASI_PERBAIKAN',
                        'MENUNGGU_VERIFIKASI_AKHIR', 'SIAP_PENOMORAN', 'SELESAI'
                    ].includes(status);

                    // Cek apakah belum sampai (masih admin/registrasi)?
                    const isBelumSampai = !isTahapLapangan && !isSudahLewat;

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* Kolom 1 */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-900">{doc.pemrakarsa}</div>
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {doc.no_registrasi || "-"}
                          </div>
                        </td>

                        {/* Kolom 2 */}
                        <td className="px-6 py-4 align-top">
                          <div className="text-gray-700 mb-1 truncate max-w-xs">{doc.kegiatan}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={10} /> {doc.lokasi_usaha || "Lokasi -"}
                          </div>
                        </td>

                        {/* Kolom 3: Status Warni-Warni */}
                        <td className="px-6 py-4 align-top">
                           {isTahapLapangan && (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                 <Clock size={12} /> Tahap Lapangan
                              </span>
                           )}
                           {isSudahLewat && (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                 <CheckCircle size={12} /> Sudah Lewat
                              </span>
                           )}
                           {isBelumSampai && (
                              <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                 <FileQuestion size={12} /> Belum/Bukan Lapangan
                              </span>
                           )}
                           
                           <div className="text-[10px] text-gray-500 mt-1 uppercase font-mono">
                              {status.replace(/_/g, ' ')}
                           </div>
                        </td>

                        {/* Kolom 4: Aksi */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                isBelumSampai
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none' // Disable jika bukan gilirannya
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                             {isSudahLewat ? 'Lihat Detail' : 'Proses'}
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