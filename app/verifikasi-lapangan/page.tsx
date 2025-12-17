import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, Calendar, CheckSquare, Clock } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // Ambil dokumen yang statusnya relevan dengan LAPANGAN
  // Contoh status: 'MENUNGGU_JADWAL_LAPANGAN' atau 'SEDANG_VERIFIKASI_LAPANGAN'
  const dataDokumen = await db.collection('dokumen')
    .find({ 
        status: { 
          $in: ['MENUNGGU_VERIFIKASI_LAPANGAN', 'SEDANG_VERIFIKASI_LAPANGAN'] 
        } 
    })
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Jadwal dan hasil peninjauan lokasi usaha/kegiatan.</p>
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
                  <th className="px-6 py-3">Pemrakarsa</th>
                  <th className="px-6 py-3">Lokasi Kegiatan</th>
                  <th className="px-6 py-3">Status Lapangan</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Tidak ada antrian verifikasi lapangan.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => (
                    <tr key={doc._id.toString()} className="hover:bg-green-50/30 transition-colors">
                      
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-gray-800">{doc.pemrakarsa}</div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">{doc.no_registrasi}</div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="text-gray-700">{doc.kegiatan}</div>
                        {/* Jika ada field alamat, tampilkan disini */}
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin size={10} /> {doc.lokasi_usaha || "Lokasi sesuai dokumen"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                         <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold border border-orange-200">
                            <Clock size={12} /> Belum Dikunjungi
                         </span>
                      </td>

                      <td className="px-6 py-4 text-center align-top">
                        <Link 
                          href={`/verifikasi-lapangan/${doc._id.toString()}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition shadow-sm"
                        >
                          <Calendar size={14} /> Atur Jadwal
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