import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, BookOpen, CheckCircle, Clock, FileQuestion } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // --- 1. PENGAMBILAN DATA (FETCHING) ---
  // Ambil semua dokumen, urutkan dari yang terbaru
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER HALAMAN */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Jadwal dan hasil peninjauan lokasi usaha/kegiatan (Tahap C).</p>
        </div>

        {/* CONTAINER TABEL */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          
          {/* HEADER TABEL (Warna Hijau untuk Verifikasi Lapangan) */}
          <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
               <MapPin size={18} /> Daftar Verifikasi Lapangan
            </h3>
            <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
               {dataDokumen.length} Dokumen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              {/* HEAD TABEL - STYLE MENYESUAIKAN REFERENSI ANDA */}
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">No. Registrasi</th>
                  <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">No. BA Verifikasi Lapangan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Belum ada dokumen masuk.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    
                    // --- 2. PERBAIKAN DATA & STATUS ---
                    
                    // Ambil No Registrasi (Prioritas field: no_registrasi -> no_urut -> strip)
                    const noRegistrasi = doc.no_registrasi || doc.no_urut || "-";

                    // Ambil No BA Lapangan (Prioritas field: nomor_ba_lapangan -> nomor_berita_acara -> strip)
                    const noBALapangan = doc.nomor_ba_lapangan || doc.nomor_berita_acara || null;

                    // Logika Status
                    const status = doc.status || "";
                    
                    // Cek apakah sedang/selesai di tahap lapangan
                    const isTahapLapangan = ['MENUNGGU_VERIFIKASI_LAPANGAN', 'SEDANG_VERIFIKASI_LAPANGAN', 'SELESAI_VERIFIKASI_LAPANGAN'].includes(status);
                    
                    // Cek apakah sudah lewat (sudah di substansi/risalah/selesai)
                    const isSudahLewat = ['MENUNGGU_PEMERIKSAAN_SUBSTANSI', 'MENUNGGU_VERIFIKASI_PERBAIKAN', 'MENUNGGU_VERIFIKASI_AKHIR', 'SIAP_PENOMORAN', 'SELESAI'].includes(status);
                    
                    // Cek apakah belum sampai (masih registrasi/uji admin)
                    const isBelumSampai = !isTahapLapangan && !isSudahLewat;

                    // Tentukan Label Status Visual
                    let statusLabel;
                    if (isBelumSampai) {
                        statusLabel = (
                            <span className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                                <FileQuestion className="w-3 h-3" /> Belum Masuk
                            </span>
                        );
                    } else if (isSudahLewat || noBALapangan) {
                        statusLabel = (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded w-fit border border-green-200">
                                <CheckCircle className="w-3 h-3" /> Selesai
                            </span>
                        );
                    } else {
                         statusLabel = (
                            <span className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded w-fit border border-orange-200 animate-pulse">
                                <Clock className="w-3 h-3" /> Proses Lapangan
                            </span>
                        );
                    }

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50 transition-colors">
                        
                        {/* 1. NO REGISTRASI (Style: Mono, Biru/Hijau) */}
                        <td className="px-6 py-4 font-mono font-medium text-green-700 align-top">
                          {noRegistrasi}
                          <div className="text-xs text-gray-400 mt-1">Jenis: UKL-UPL</div>
                        </td>

                        {/* 2. PEMRAKARSA / KEGIATAN */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800">{doc.pemrakarsa || doc.namaPemrakarsa}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs mt-1">{doc.kegiatan || doc.namaKegiatan}</div>
                        </td>

                        {/* 3. NO BA VERIFIKASI LAPANGAN */}
                        <td className="px-6 py-4 align-top">
                          {noBALapangan ? (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                <span className="font-mono text-xs font-bold">{noBALapangan}</span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-xs italic">
                                Belum Terbit
                            </span>
                          )}
                        </td>

                        {/* 4. STATUS */}
                        <td className="px-6 py-4 align-top">
                          {statusLabel}
                          {/* Tampilkan status asli database kecil di bawahnya */}
                          <div className="text-[10px] text-gray-400 mt-1 uppercase">
                             {status.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* 5. AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                isBelumSampai
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none border border-gray-200' 
                                : (noBALapangan ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' : 'bg-green-600 hover:bg-green-700 text-white')
                            }`}
                          >
                            <BookOpen className="w-3 h-3" /> 
                            {noBALapangan ? 'Detail' : 'Input Hasil'}
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