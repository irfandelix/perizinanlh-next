import React from 'react';
import RisalahFinalPage, { HistoryItem, CurrentDocData } from '@/components/RisalahFinalPage';

// --- SERVER SIDE FUNCTIONS ---

async function getRiwayatDokumen(): Promise<HistoryItem[]> {
  // TODO: Ganti dengan Fetch DB sungguhan (Prisma/Drizzle/API)
  return [
    { no_sk: '660/015/PKPLH/2025', tgl: '2025-02-10', pemrakarsa: 'PT. SUMBER ABADI' },
    { no_sk: '660/014/PKPLH/2025', tgl: '2025-02-08', pemrakarsa: 'CV. JAYA KARYA' },
    { no_sk: '660/013/PKPLH/2025', tgl: '2025-02-05', pemrakarsa: 'PT. BANGUN NEGERI' },
  ];
}

async function getCurrentDokumen(): Promise<CurrentDocData> {
  // TODO: Ambil data berdasarkan params ID
  return {
    pemrakarsa: 'PT. CAHAYA MAKMUR SEKALI',
    no_registrasi: 'REG.UKLUPL/2025/0012'
  };
}

// Server Action untuk Handle Submit
async function saveRisalahAction(tanggal: string) {
  "use server";
  
  console.log("Menyimpan ke Database dengan tanggal:", tanggal);
  // Tambahkan logic insert DB di sini
  // revalidatePath('/verifikasi');
}

// --- MAIN PAGE COMPONENT ---

export default async function Page() {
  // Fetch data secara parallel
  const historyData = await getRiwayatDokumen();
  const docData = await getCurrentDokumen();

  return (
    <RisalahFinalPage 
      riwayatDokumen={historyData}
      dataDokumen={docData}
      onSaveAction={saveRisalahAction}
    />
  );
}