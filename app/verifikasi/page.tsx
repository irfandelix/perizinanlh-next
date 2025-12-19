import Link from 'next/link';
import { getDb } from '@/lib/db';
import { FileText } from 'lucide-react';

// Agar halaman selalu refresh data terbaru
export const dynamic = 'force-dynamic';

export default async function VerifikasiPage() {
  const db = await getDb();

  // --- QUERY DATABASE ---
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ noUrut: -1 }) 
    .limit(100) 
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir</h1>
          <p className="text-gray-500 text-sm">
            Menampilkan data dari yang terbaru ke yang lama.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3 min-w-[180px]">No. Registrasi</th>
                  <th className="px-6 py-3 min-w-[250px]">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">No. Risalah (RPD)</th>
                  <th className="px-6 py-3">Status Saat Ini</th>
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
                    // --- 1. DATA DASAR ---
                    const nama = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "Tanpa Nama";
                    const kegiatan = doc.namaKegiatan || doc.judul_kegiatan || doc.kegiatan || "-";
                    const noReg = doc.nomorChecklist || doc.no_registrasi || doc.nomor_registrasi || ("Urut: " + doc.noUrut);
                    
                    // --- 2. DATA RPD ---
                    const nomorRPD = doc.nomorRisalah || doc.no_risalah || doc.nomor_risalah || null;
                    const isAdaRPD = !!nomorRPD; // Boolean: true jika RPD ada

                    // --- 3. LOGIKA STATUS BARU ---
                    // Dokumen dianggap SELESAI jika: Ada Status di DB -ATAU- Sudah punya Nomor RPD
                    const isSelesai = !!doc.status || isAdaRPD;
                    
                    // Tentukan Teks Status
                    let statusText = doc.status;
                    if (!statusText) {
                        // Jika status DB kosong, tapi RPD ada, maka otomatis "RPD TERBIT"
                        statusText = isAdaRPD ? "RPD TERBIT" : "BELUM DIPROSES";
                    }

                    const statusClass = isSelesai
                        ? "bg-green-100 text-green-800 border-green-300" // Hijau
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"; // Kuning

                    return (
                      <tr key={doc._id.toString()} className={`hover:bg-gray-50 transition-colors ${isSelesai ? 'bg-green-50/20' : ''}`}>
                        
                        {/* NO REGISTRASI */}
                        <td className="px-6 py-4 align-top">
                            <div className="font-mono text-blue-700 font-bold text-xs">
                                {noReg}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                                ID: {doc.noUrut}
                            </div>
                        </td>

                        {/* PEMRAKARSA */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800 text-sm">{nama}</div>
                          <div className="text-xs text-gray-500 mt-1">{kegiatan}</div>
                        </td>

                        {/* RPD (RISALAH) - PERBAIKAN TAMPILAN */}
                        <td className="px-6 py-4 align-top">
                          {isAdaRPD ? (
                            <div className="flex items-center gap-2 text-gray-700">
                                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                {/* PERBAIKAN 1: whitespace-nowrap agar 1 baris */}
                                <span className="font-mono text-xs font-bold whitespace-nowrap text-purple-700">
                                    {nomorRPD}
                                </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">- Belum Terbit -</span>
                          )}
                        </td>
                        
                        {/* STATUS */}
                        <td className="px-6 py-4 align-top">
                          <span className={`px-2 py-1 rounded font-bold text-[10px] border inline-block whitespace-nowrap ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc.noUrut}`} 
                            className={`inline-block text-xs font-bold py-2 px-4 rounded transition-colors shadow-sm whitespace-nowrap ${
                                isSelesai 
                                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100" 
                                : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                            }`}
                          >
                            {isSelesai ? 'Lihat Detail' : 'Proses'}
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