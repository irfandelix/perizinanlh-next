import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import RisalahFinalPage from '@/components/RisalahFinalPage'; // Pastikan komponen UI ini ada

// --- SERVER ACTIONS ---

// 1. Ambil History SK Terakhir (untuk referensi nomor)
async function getHistorySK() {
  const db = await getDb();
  const history = await db.collection('izin_terbit')
    .find({})
    .sort({ tanggal_terbit: -1 })
    .limit(3)
    .toArray();
    
  // Mapping agar sesuai props komponen UI
  // Asumsi di collection 'izin_terbit' ada field: nomor_sk, tanggal_terbit, nama_pemrakarsa
  return history.map((h: any) => ({
    no_sk: h.nomor_sk,
    tgl: h.tanggal_terbit, 
    pemrakarsa: h.nama_pemrakarsa || 'Unknown'
  }));
}

// 2. Ambil Detail Dokumen Saat Ini
async function getDocById(id: string) {
  const db = await getDb();
  try {
    const doc = await db.collection('permohonan').findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return {
      pemrakarsa: doc.pemrakarsa,
      no_registrasi: doc.no_registrasi
    };
  } catch (e) {
    return null;
  }
}

// 3. Action Simpan (Update DB)
async function saveAction(formData: any) {
  "use server";
  
  const { id, tanggalPengolahan } = formData;
  const db = await getDb();
  
  // Logic Generator Nomor (Contoh Sederhana)
  const timestamp = Math.floor(Date.now() / 1000).toString().substr(-4);
  const newNomorSK = `660/${timestamp}/PKPLH/2025`; 

  try {
    const objectId = new ObjectId(id);
    
    // A. Update status di tabel permohonan
    const doc = await db.collection('permohonan').findOne({ _id: objectId });
    await db.collection('permohonan').updateOne(
        { _id: objectId },
        { 
            $set: { 
                status: 'SELESAI',
                nomor_sk: newNomorSK,
                tanggal_sk: tanggalPengolahan 
            }
        }
    );

    // B. Simpan ke Arsip Izin Terbit (untuk history)
    await db.collection('izin_terbit').insertOne({
        permohonan_id: objectId,
        nomor_sk: newNomorSK,
        tanggal_terbit: tanggalPengolahan,
        nama_pemrakarsa: doc?.pemrakarsa || '-',
        created_at: new Date()
    });

  } catch (error) {
    console.error("Gagal simpan:", error);
    throw new Error("Database error");
  }

  // Refresh halaman tabel & redirect
  revalidatePath('/verifikasi');
  redirect('/verifikasi');
}


// --- MAIN PAGE COMPONENT ---
export default async function HalamanDetailVerifikasi({ params }: { params: { id: string } }) {
  const [historyData, docData] = await Promise.all([
    getHistorySK(),
    getDocById(params.id)
  ]);

  if (!docData) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-red-500 font-bold">Error 404</h2>
        <p>Dokumen dengan ID tersebut tidak ditemukan.</p>
      </div>
    );
  }

  // Wrapper untuk bind ID ke Server Action
  const bindedAction = async (tanggal: string) => {
    "use server";
    await saveAction({ id: params.id, tanggalPengolahan: tanggal });
  };

  return (
    <RisalahFinalPage 
      riwayatDokumen={historyData}
      dataDokumen={docData}
      onSaveAction={bindedAction}
    />
  );
}