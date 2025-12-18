import Link from 'next/link';
import { getDb } from '@/lib/db';

// Agar halaman selalu refresh data terbaru (Server Component)
export const dynamic = 'force-dynamic';

export default async function VerifikasiPage() {
  const db = await getDb();

  // --- DEBUGGING MODE: ON ---
  // Ambil SEMUA data, urutkan dari yang terbaru diinput
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    .sort({ _id: -1 }) // Paling baru di atas
    .limit(50)         // Batasi 50 biar tidak berat
    .toArray();

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir</h1>
          <p className="text-blue-600 text-sm font-bold">
            Verifikasi kelengkapan pasca perbaikan sebelum dokumen diteruskan ke bagian Arsip untuk penomoran SK.
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
                    // --- LOGIKA PERBAIKAN TAMPILAN ---
                    
                    // 1. Cek Nama Pemrakarsa (Bisa beda-beda nama fieldnya di DB lama vs baru)
                    const nama = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "Tanpa Nama";
                    
                    // 2. Ambil Info Kegiatan/Registrasi
                    const kegiatan = doc.namaKegiatan || doc.judul_kegiatan || doc.kegiatan || "-";
                    const noReg = doc.nomorChecklist || doc.no_registrasi || doc.noUrut || "?";

                    // 3. Cek apakah dokumen ini sudah punya Status Verifikasi?
                    // (Logika: Jika status kosong, berarti belum pernah diproses)
                    const statusText = doc.status || "BELUM DIPROSES";
                    const statusColor = doc.status 
                        ? "bg-green-100 text-green-800 border-green-300" // Jika ada isinya (Hijau)
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"; // Jika kosong (Kuning)

                    return (
                      <tr key={doc._id.toString()} className="hover:bg-gray-50">
                        
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
                          <span className={`px-2 py-1 rounded font-bold text-xs border ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* KOLOM 3: AKSI (LINK YANG BENAR) */}
                        <td className="px-6 py-4 text-center">
                          {/* PENTING:
                              Href mengarah ke doc.noUrut (Angka), BUKAN doc._id (String Aneh).
                              Contoh: /verifikasi/101
                          */}
                          <Link 
                            href={`/verifikasi-lapangan/${doc.noUrut}`} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
                          >
                            Pilih / Proses
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