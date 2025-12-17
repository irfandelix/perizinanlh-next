import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { CheckCircle, FileText, ArrowLeft, User, Calendar } from 'lucide-react';

// --- SERVER ACTION (Hanya Update Status) ---
async function submitVerifikasi(formData: FormData) {
  "use server";
  
  const id = formData.get('id') as string;
  const catatan = formData.get('catatan') as string;
  const tanggal = formData.get('tanggal') as string; // Tanggal Risalah/Verifikasi

  if (!id) return;

  const db = await getDb();
  const objectId = new ObjectId(id);

  try {
    // Update Status menjadi SIAP_PENOMORAN / MENUNGGU_ARSIP
    // Tidak menginput Nomor SK di sini
    await db.collection('dokumen').updateOne(
        { _id: objectId },
        { 
            $set: { 
                status: 'SIAP_PENOMORAN', // Status baru agar muncul di menu Pengarsipan
                posisi_dokumen: 'Pengarsipan/Tata Usaha',
                tanggal_risalah: tanggal,
                catatan_verifikasi: catatan
            }
        }
    );

  } catch (error) {
    console.error("Gagal verifikasi:", error);
    throw new Error("Database error");
  }

  // Refresh dan kembali ke tabel antrian
  revalidatePath('/verifikasi');
  redirect('/verifikasi');
}

// --- DATA FETCHING ---
async function getDocById(id: string) {
  const db = await getDb();
  try {
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection('dokumen').findOne({ _id: new ObjectId(id) });
    return doc;
  } catch (e) {
    return null;
  }
}

// --- HALAMAN UTAMA ---
export default async function HalamanDetailVerifikasi({ params }: { params: { id: string } }) {
  const doc = await getDocById(params.id);

  if (!doc) {
    return (
      <div className="p-10 text-center text-red-500">
        Dokumen tidak ditemukan. <Link href="/verifikasi" className="underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Kembali */}
        <Link href="/verifikasi" className="flex items-center text-gray-500 hover:text-blue-600 mb-6 w-fit transition">
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Antrian
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Akhir (Risalah)</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verifikasi kelengkapan pasca perbaikan sebelum dokumen diteruskan ke bagian Arsip untuk penomoran SK.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI: INFO DOKUMEN (READ ONLY) */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-700 border-b pb-3 mb-4 flex items-center gap-2">
                        <FileText size={18}/> Informasi Dokumen
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Pemrakarsa</label>
                            <div className="font-medium text-gray-800 text-lg">{doc.pemrakarsa}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Kegiatan</label>
                            <div className="text-gray-700">{doc.kegiatan}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">No. Registrasi</label>
                                <div className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit text-sm">
                                    {doc.no_registrasi}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Tanggal Masuk</label>
                                <div className="text-gray-600 text-sm">
                                    {doc.tanggal_masuk ? new Date(doc.tanggal_masuk).toLocaleDateString('id-ID') : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Riwayat Perbaikan (Opsional, visual saja) */}
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="text-blue-600 mt-1" size={20} />
                        <div>
                            <h4 className="font-bold text-blue-800">Status: Perbaikan Selesai</h4>
                            <p className="text-sm text-blue-600 mt-1">
                                Dokumen ini telah melalui proses perbaikan dan dinyatakan lengkap secara substansi. 
                                Lanjutkan untuk memberikan persetujuan penerbitan SK.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: FORM PERSETUJUAN */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
                    <h3 className="font-bold text-gray-800 mb-4">Form Persetujuan</h3>
                    
                    <form action={submitVerifikasi} className="space-y-4">
                        <input type="hidden" name="id" value={params.id} />

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Tanggal Verifikasi/Risalah
                            </label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="tanggal"
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Catatan (Opsional)
                            </label>
                            <textarea 
                                name="catatan"
                                rows={3}
                                placeholder="Catatan untuk bagian pengarsipan..."
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition flex justify-center items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Setujui & Kirim ke Arsip
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-3">
                                Dokumen akan berpindah ke menu Pengarsipan untuk penomoran SK.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}