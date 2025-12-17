import Link from 'next/link';
import { getDb } from '@/lib/db';
import { MapPin, BookOpen, CheckCircle, Clock, FileQuestion } from 'lucide-react';

export default async function VerifikasiLapanganPage() {
  const db = await getDb();

  // 1. AMBIL SEMUA DATA (TANPA FILTER)
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ _id: -1 })
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
          <p className="text-gray-500 text-sm">Monitoring seluruh data verifikasi lapangan.</p>
        </div>

        {/* CONTAINER TABEL */}
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
                  {/* Tambahkan min-w agar kolom tidak menyempit */}
                  <th className="px-6 py-3 min-w-[250px]">No. Registrasi</th>
                  <th className="px-6 py-3 min-w-[200px]">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3 min-w-[180px]">No. BA Verifikasi Lapangan</th>
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
                    
                    // --- 1. LOGIKA DATA "ANTI-GAGAL" ---
                    // Menggabungkan variabel dari contoh Anda (nomorChecklist) dengan variabel umum
                    
                    // Cek No Registrasi (Prioritas: nomorChecklist -> no_registrasi -> dll)
                    const noRegistrasi = 
                        doc.nomorChecklist || // Sesuai contoh Anda
                        doc.no_registrasi || 
                        doc.nomor_registrasi || 
                        doc.no_reg || 
                        doc.noUrut || 
                        "-";

                    // Cek No BA (Prioritas: nomorBAVerlap -> nomor_ba_lapangan)
                    const noBALapangan = 
                        doc.nomorBAVerlap || // Sesuai contoh Anda
                        doc.nomor_ba_lapangan || 
                        doc.nomor_berita_acara || 
                        doc.no_ba_lapangan ||
                        null;

                    // Cek Nama Pemrakarsa & Kegiatan
                    const pemrakarsa = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "-";
                    const kegiatan = doc.namaKegiatan || doc.kegiatan || doc.judul_kegiatan || "-";
                    const lokasi = doc.lokasi_usaha || doc.lokasi || doc.alamat || "-";

                    // --- 2. LOGIKA STATUS ---
                    const status = doc.status || "";
                    
                    // Cek Tahapan
                    const isTahapLapangan = ['MENUNGGU_VERIFIKASI_LAPANGAN', 'SEDANG_VERIFIKASI_LAPANGAN', 'SELESAI_VERIFIKASI_LAPANGAN'].includes(status);
                    const isSudahLewat = ['MENUNGGU_PEMERIKSAAN_SUBSTANSI', 'SEDANG_PEMERIKSAAN_SUBSTANSI', 'MENUNGGU_VERIFIKASI_PERBAIKAN', 'MENUNGGU_VERIFIKASI_AKHIR', 'SIAP_PENOMORAN', 'SELESAI'].includes(status);
                    const isBelumSampai = !isTahapLapangan && !isSudahLewat;

                    // Label Status Visual
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
                        
                        {/* 1. NO REGISTRASI */}
                        <td className="px-6 py-4 align-top">
                           {/* Saya hapus break-all, ganti whitespace-nowrap agar tidak terpotong */}
                           <div className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap">
                              {noRegistrasi}
                           </div>
                           <div className="text-xs text-gray-400 mt-1">Jenis: UKL-UPL</div>
                        </td>

                        {/* 2. PEMRAKARSA / KEGIATAN */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800">{pemrakarsa}</div>
                          <div className="text-xs text-gray-500 mt-1 mb-1">{kegiatan}</div>
                          {lokasi !== "-" && (
                             <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <MapPin size={10} /> {lokasi}
                             </div>
                          )}
                        </td>

                        {/* 3. NO BA VERIFIKASI LAPANGAN */}
                        <td className="px-6 py-4 align-top">
                          {noBALapangan ? (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 w-fit whitespace-nowrap">
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
                          <div className="text-[10px] text-gray-400 mt-1 uppercase">
                             {status.replace(/_/g, ' ')}
                          </div>
                        </td>

                        {/* 5. AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc._id.toString()}`}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all whitespace-nowrap ${
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