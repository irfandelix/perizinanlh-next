import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, Calendar, CheckCircle, Clock, FileText, ArrowRight, FileQuestion } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // Ambil semua data
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Monitoring Data (Total: {dataDokumen.length} Item)</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-8">
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
                    
                    // --- TEBAK NAMA KOLOM (FALLBACK) ---
                    // Kita coba semua kemungkinan nama field biar pasti muncul
                    const realPemrakarsa = doc.pemrakarsa || doc.namaPemrakarsa || doc.nama_pemrakarsa || doc.prakarsa || "-";
                    const realKegiatan = doc.kegiatan || doc.namaKegiatan || doc.judul_kegiatan || doc.nama_kegiatan || "-";
                    const realNoReg = doc.no_registrasi || doc.no_urut || doc.noUrut || doc.nomor_registrasi || "-";
                    const realLokasi = doc.lokasi_usaha || doc.lokasi || doc.alamat || "-";
                    const realStatus = doc.status || "TANPA_STATUS";

                    // Logic Status
                    const isTahapLapangan = ['MENUNGGU_VERIFIKASI_LAPANGAN', 'SEDANG_VERIFIKASI_LAPANGAN', 'SELESAI_VERIFIKASI_LAPANGAN'].includes(realStatus);
                    const isSudahLewat = ['MENUNGGU_PEMERIKSAAN_SUBSTANSI', 'MENUNGGU_VERIFIKASI_PERBAIKAN', 'MENUNGGU_VERIFIKASI_AKHIR', 'SIAP_PENOMORAN', 'SELESAI'].includes(realStatus);
                    const isBelumSampai = !isTahapLapangan && !isSudahLewat;

                    const nomorBA = doc.nomor_ba_lapangan || doc.nomor_berita_acara || "-";

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. NO. REGISTRASI */}
                        <td className="px-6 py-4 align-top font-mono font-bold text-green-700">
                          {realNoReg}
                        </td>

                        {/* 2. PEMRAKARSA / KEGIATAN */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-900">{realPemrakarsa}</div>
                          <div className="text-gray-600 text-xs mt-1 mb-1">{realKegiatan}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MapPin size={10} /> {realLokasi}
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
                           <div className="text-xs font-bold text-gray-500 uppercase">
                              {realStatus.replace(/_/g, ' ')}
                           </div>
                        </td>

                        {/* 5. AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition"
                          >
                             Proses <ArrowRight size={12} />
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

        {/* --- AREA DEBUG (KOTAK HITAM DI BAWAH) --- */}
        {/* Ini untuk mengintip nama kolom asli di database Anda */}
        {dataDokumen.length > 0 && (
            <div className="mt-10 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-xs overflow-auto">
                <h3 className="font-bold text-white mb-2 text-lg">🔍 KOTAK INTIP DATA (DEBUG)</h3>
                <p className="text-gray-400 mb-2">Lihat di bawah ini, apa nama variabel untuk Pemrakarsa? Apakah 'pemrakarsa' atau 'namaPemrakarsa'?</p>
                <pre>{JSON.stringify(dataDokumen[0], null, 2)}</pre>
            </div>
        )}

      </div>
    </div>
  );
}