import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, Calendar, CheckCircle, Clock, FileText, ArrowRight, FileQuestion } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // Ambil SEMUA data (tanpa filter status)
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Daftar antrian dan riwayat verifikasi lapangan.</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
               <MapPin size={18} /> Data Verifikasi Lapangan
            </h3>
            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3 border-b">No. Registrasi</th>
                  <th className="px-6 py-3 border-b">Pemrakarsa / Kegiatan</th>
                  {/* --- UBAH JUDUL KOLOM DI SINI --- */}
                  <th className="px-6 py-3 border-b">No. BA Verifikasi Lapangan</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Data Kosong.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    
                    // --- LOGIKA STATUS ---
                    const status = doc.status || "TANPA_STATUS";
                    const isTahapLapangan = ['MENUNGGU_VERIFIKASI_LAPANGAN', 'SEDANG_VERIFIKASI_LAPANGAN', 'SELESAI_VERIFIKASI_LAPANGAN'].includes(status);
                    const isSudahLewat = ['MENUNGGU_PEMERIKSAAN_SUBSTANSI', 'MENUNGGU_VERIFIKASI_PERBAIKAN', 'MENUNGGU_VERIFIKASI_AKHIR', 'SIAP_PENOMORAN', 'SELESAI'].includes(status);
                    const isBelumSampai = !isTahapLapangan && !isSudahLewat;

                    // Cek Nomor BA (Prioritaskan field khusus lapangan)
                    const nomorBA = doc.nomor_ba_lapangan || doc.nomor_berita_acara || "-";

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. NO. REGISTRASI */}
                        <td className="px-6 py-4 align-top font-mono font-bold text-green-700">
                          {doc.no_registrasi || "-"}
                        </td>

                        {/* 2. PEMRAKARSA / KEGIATAN */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-900">{doc.pemrakarsa}</div>
                          <div className="text-gray-600 text-xs mt-1 mb-1">{doc.kegiatan}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MapPin size={10} /> {doc.lokasi_usaha || "Lokasi -"}
                          </div>
                        </td>

                        {/* 3. NO. BA VERIFIKASI LAPANGAN */}
                        <td className="px-6 py-4 align-top">
                          {nomorBA !== "-" ? (
                            <span className="font-mono bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-1 rounded text-xs font-semibold">
                                {nomorBA}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Belum Terbit</span>
                          )}
                        </td>

                        {/* 4. STATUS */}
                        <td className="px-6 py-4 align-top">
                           {isTahapLapangan && (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                 <Clock size={12} /> Proses Lapangan
                              </span>
                           )}
                           {isSudahLewat && (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                 <CheckCircle size={12} /> Selesai
                              </span>
                           )}
                           {isBelumSampai && (
                              <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                 <FileQuestion size={12} /> Belum Masuk
                              </span>
                           )}
                        </td>

                        {/* 5. AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                isBelumSampai
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                             {isSudahLewat ? 'Lihat Detail' : 'Proses'} <ArrowRight size={12} />
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