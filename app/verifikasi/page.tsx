import Link from 'next/link';
import { getDb } from '@/lib/db';

// Agar halaman selalu refresh data terbaru (Server Component)
export const dynamic = 'force-dynamic';

export default async function VerifikasiPage() {
  const db = await getDb();

  // --- DEBUGGING MODE: ON ---
  const dataDokumen = await db.collection('dokumen')
    .find({}) // FILTER KOSONG = TAMPILKAN SEMUA (Belum & Sudah)
    // SORTING SAKTI: 
    // Prioritaskan yang baru saja di-update/diedit (updatedAt), 
    // lalu urutkan sisanya berdasarkan yang terbaru dibuat (_id).
    .sort({ updatedAt: -1, _id: -1 }) 
    .limit(100) // Naikkan limit jadi 100 biar data lama yang baru diedit tetap kelihatan
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir (DEBUG LIST)</h1>
          <p className="text-blue-600 text-sm font-bold">
            ℹ️ Menampilkan 100 dokumen terakhir (Diurutkan berdasarkan yang baru diedit/dibuat).
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">Status Saat Ini</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                      Database Kosong.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    // --- LOGIKA TAMPILAN ---
                    
                    // 1. Cek Nama (Support berbagai format field)
                    const nama = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "Tanpa Nama";
                    
                    // 2. Info Tambahan
                    const kegiatan = doc.namaKegiatan || doc.judul_kegiatan || doc.kegiatan || "-";
                    const noReg = doc.nomorChecklist || doc.no_registrasi || doc.noUrut || "?";

                    // 3. Status
                    // Jika ada status (sudah diproses), warnanya HIJAU. Jika belum, KUNING.
                    const statusText = doc.status || "BELUM DIPROSES";
                    const isSelesai = !!doc.status; // Boolean check
                    
                    const statusClass = isSelesai
                        ? "bg-green-100 text-green-800 border-green-300" // Hijau (Sudah)
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"; // Kuning (Belum)

                    return (
                      <tr key={doc._id.toString()} className={`hover:bg-gray-50 transition-colors ${isSelesai ? 'bg-green-50/30' : ''}`}>
                        
                        {/* KOLOM 1: IDENTITAS */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-base">{nama}</div>
                          <div className="text-xs text-gray-500 mb-1">{kegiatan}</div>
                          <div className="text-[10px] font-mono bg-gray-100 inline-block px-1 rounded text-gray-500">
                            Reg: {noReg} | No Urut: {doc.noUrut}
                          </div>
                        </td>
                        
                        {/* KOLOM 2: STATUS */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded font-bold text-xs border ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* KOLOM 3: AKSI */}
                        <td className="px-6 py-4 text-center">
                          <Link 
                            href={`/verifikasi-lapangan/${doc.noUrut}`} 
                            className={`inline-block text-xs font-bold py-2 px-4 rounded transition-colors ${
                                isSelesai 
                                ? "bg-white text-green-600 border border-green-600 hover:bg-green-50" 
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isSelesai ? 'Edit / Lihat' : 'Proses'}
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