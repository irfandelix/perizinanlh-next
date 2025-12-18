import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

// Agar halaman selalu refresh data terbaru
export const dynamic = 'force-dynamic';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // Ambil data
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .project({
        _id: 1,
        nomorChecklist: 1, no_registrasi: 1, nomor_registrasi: 1, no_reg: 1, noUrut: 1,
        nomorBAVerlap: 1, nomor_ba_lapangan: 1, nomor_berita_acara: 1, no_ba_lapangan: 1,
        namaPemrakarsa: 1, pemrakarsa: 1, nama_pemrakarsa: 1,
        namaKegiatan: 1, kegiatan: 1, judul_kegiatan: 1,
        lokasi_usaha: 1, lokasi: 1, alamat: 1,
        status: 1
    })
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Monitoring dan input hasil verifikasi lapangan.</p>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          
          <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
               <MapPin size={18} /> Daftar Dokumen
            </h3>
            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3 min-w-[200px]">No. Registrasi</th>
                  <th className="px-6 py-3 min-w-[250px]">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3 min-w-[200px]">No. BA Lapangan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Database Kosong.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    
                    // --- 1. NORMALISASI DATA ---
                    const noRegistrasi = doc.nomorChecklist || doc.no_registrasi || doc.nomor_registrasi || doc.no_reg || doc.noUrut || "-";
                    const noBALapangan = doc.nomorBAVerlap || doc.nomor_ba_lapangan || doc.nomor_berita_acara || doc.no_ba_lapangan || null;
                    const pemrakarsa = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "-";
                    const kegiatan = doc.namaKegiatan || doc.kegiatan || doc.judul_kegiatan || "-";
                    const lokasi = doc.lokasi_usaha || doc.lokasi || doc.alamat || "-";
                    const statusRaw = doc.status || "";

                    const isSudahAdaBA = !!noBALapangan;

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* NO REGISTRASI */}
                        <td className="px-6 py-4 align-top">
                           <div className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap">
                              {noRegistrasi}
                           </div>
                        </td>

                        {/* PEMRAKARSA */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800 line-clamp-2">{pemrakarsa}</div>
                          <div className="text-xs text-gray-500 mt-1 mb-1 line-clamp-2">{kegiatan}</div>
                          {lokasi !== "-" && (
                             <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <MapPin size={10} /> <span className="line-clamp-1">{lokasi}</span>
                             </div>
                          )}
                        </td>

                        {/* NO BA */}
                        <td className="px-6 py-4 align-top">
                          {isSudahAdaBA ? (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 w-fit whitespace-nowrap">
                                <CheckCircle className="w-3 h-3" />
                                <span className="font-mono text-xs font-bold">{noBALapangan}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400 text-xs italic">
                                <AlertCircle className="w-3 h-3" /> Belum Terbit
                            </div>
                          )}
                        </td>

                        {/* STATUS (Logika Diperbaiki) */}
                        <td className="px-6 py-4 align-top">
                          {isSudahAdaBA ? (
                            // JIKA SUDAH ADA NO BA => TAMPILKAN "Selesai" (HIJAU)
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200 inline-flex items-center gap-1 font-bold">
                               <CheckCircle className="w-3 h-3" /> Selesai
                            </span>
                          ) : (
                            // JIKA BELUM => TAMPILKAN STATUS ASLI (ABU-ABU)
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs border border-gray-200 inline-block">
                               {statusRaw.replace(/_/g, ' ') || 'DRAFT'}
                            </span>
                          )}
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc.noUrut}`}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded text-xs font-bold shadow-sm transition-all whitespace-nowrap ${
                                isSudahAdaBA
                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300' 
                                : 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
                            }`}
                          >
                            <BookOpen className="w-3 h-3" /> 
                            {isSudahAdaBA ? 'Edit / Detail' : 'Input Hasil'}
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