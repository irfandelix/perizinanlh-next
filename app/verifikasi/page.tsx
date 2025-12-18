import Link from 'next/link';
import { getDb } from '@/lib/db';

// Agar halaman selalu refresh data terbaru
export const dynamic = 'force-dynamic';

export default async function VerifikasiPage() {
  const db = await getDb();

  // --- QUERY DATABASE ---
  const dataDokumen = await db.collection('dokumen')
    .find({}) 
    // SORTING: Dari noUrut terbesar (Terbaru) ke terkecil (Lama)
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
                  {/* KOLOM BARU KHUSUS NO REGISTRASI */}
                  <th className="px-6 py-3 min-w-[200px]">No. Registrasi</th>
                  <th className="px-6 py-3 min-w-[250px]">Pemrakarsa / Kegiatan</th>
                  <th className="px-6 py-3">Status Saat Ini</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {dataDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      Database Kosong.
                    </td>
                  </tr>
                ) : (
                  dataDokumen.map((doc: any) => {
                    // --- NORMALISASI DATA ---
                    const nama = doc.namaPemrakarsa || doc.pemrakarsa || doc.nama_pemrakarsa || "Tanpa Nama";
                    const kegiatan = doc.namaKegiatan || doc.judul_kegiatan || doc.kegiatan || "-";
                    
                    // Prioritas No Registrasi: Nomor Panjang (Checklist) -> Nomor DB -> No Urut
                    const noReg = doc.nomorChecklist || doc.no_registrasi || doc.nomor_registrasi || ("Urut: " + doc.noUrut);

                    const statusText = doc.status || "BELUM DIPROSES";
                    const isSelesai = !!doc.status;
                    
                    const statusClass = isSelesai
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300";

                    return (
                      <tr key={doc._id.toString()} className={`hover:bg-gray-50 transition-colors ${isSelesai ? 'bg-green-50/20' : ''}`}>
                        
                        {/* KOLOM 1: NO REGISTRASI (DITAMPILKAN JELAS) */}
                        <td className="px-6 py-4 align-top">
                            <div className="font-mono text-blue-700 font-bold text-xs">
                                {noReg}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                                ID: {doc.noUrut}
                            </div>
                        </td>

                        {/* KOLOM 2: PEMRAKARSA */}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-800 text-sm">{nama}</div>
                          <div className="text-xs text-gray-500 mt-1">{kegiatan}</div>
                        </td>
                        
                        {/* KOLOM 3: STATUS */}
                        <td className="px-6 py-4 align-top">
                          <span className={`px-2 py-1 rounded font-bold text-[10px] border inline-block ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* KOLOM 4: AKSI */}
                        <td className="px-6 py-4 text-center align-top">
                          <Link 
                            href={`/verifikasi-lapangan/${doc.noUrut}`} 
                            className={`inline-block text-xs font-bold py-2 px-4 rounded transition-colors shadow-sm ${
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