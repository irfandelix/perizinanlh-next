"use client";

import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, History, AlertCircle, ArrowRight, Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- DEFINISI TIPE DATA (TypeScript Interfaces) ---

export interface HistoryItem {
  no_sk: string;
  tgl: string; // Format YYYY-MM-DD
  pemrakarsa: string;
}

export interface CurrentDocData {
  pemrakarsa: string;
  no_registrasi: string;
}

interface RisalahFinalPageProps {
  riwayatDokumen: HistoryItem[];
  dataDokumen: CurrentDocData;
  onSaveAction: (tanggal: string) => Promise<void>; // Server Action / API function
}

// --- KOMPONEN UTAMA ---

export default function RisalahFinalPage({ 
  riwayatDokumen = [], 
  dataDokumen, 
  onSaveAction 
}: RisalahFinalPageProps) {

  const router = useRouter();
  const [tanggalPengolahan, setTanggalPengolahan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ambil data terakhir untuk validasi backdate
  const lastDoc = riwayatDokumen.length > 0 ? riwayatDokumen[0] : null;
  const lastDate = lastDoc?.tgl; 

  // Logic: Invalid jika tanggal user < tanggal dokumen terakhir
  const isDateInvalid = Boolean(
    tanggalPengolahan && lastDate && tanggalPengolahan < lastDate
  );

  const handleSaveClick = async () => {
    if (!tanggalPengolahan) return alert("Mohon pilih tanggal pengolahan.");
    if (isDateInvalid) return alert("Tanggal tidak valid (Backdate).");
    
    setIsSubmitting(true);

    try {
      // Panggil fungsi yang dipassing dari parent (bisa Server Action)
      await onSaveAction(tanggalPengolahan);
      
      alert("Berhasil! Nomor SK telah digenerate.");
      router.push('/dashboard'); // Redirect
      
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* HEADER */}
        <div className="bg-green-50 border-b border-green-100 p-6 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CheckCircle size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Verifikasi & Penomoran Akhir</h1>
            <p className="text-sm text-gray-600">
              Pastikan urutan nomor surat sesuai dengan tanggal pengolahan.
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: FORM INPUT */}
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 border-b pb-2">Dokumen Saat Ini</h3>
            
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 space-y-3">
               <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">Pemrakarsa</label>
                  <div className="font-bold text-gray-800 text-lg">{dataDokumen.pemrakarsa}</div>
               </div>
               <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">No. Registrasi</label>
                  <div className="font-mono text-gray-700">{dataDokumen.no_registrasi}</div>
               </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pilih Tanggal Pengolahan / Terbit SK
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={tanggalPengolahan}
                  onChange={(e) => setTanggalPengolahan(e.target.value)}
                  className={`w-full p-3 border-2 rounded-lg font-medium focus:ring-4 transition-all outline-none ${
                    isDateInvalid 
                      ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-100' 
                      : 'border-blue-200 bg-white text-gray-800 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                <Calendar className={`absolute right-3 top-3.5 ${isDateInvalid ? 'text-red-400' : 'text-gray-400'}`} size={20} />
              </div>

              {isDateInvalid && (
                 <div className="mt-2 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100 animate-pulse">
                    <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                    <span>
                      <b>Peringatan Alur Mundur:</b> Tanggal yang dipilih lebih tua dari dokumen terakhir ({lastDate}).
                    </span>
                 </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: HISTORY */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-fit">
            <div className="flex items-center gap-2 mb-4">
               <History size={18} className="text-gray-500"/>
               <h3 className="font-bold text-gray-700">Referensi Terbit Terakhir</h3>
            </div>
            
            <div className="space-y-3 relative">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-300 z-0"></div>

                {riwayatDokumen.length === 0 ? (
                    <div className="text-sm text-gray-400 italic pl-8">Belum ada riwayat dokumen.</div>
                ) : (
                    riwayatDokumen.map((doc, idx) => (
                        <div key={idx} className="relative z-10 flex gap-3 items-start opacity-80 hover:opacity-100">
                            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center shrink-0 shadow-sm text-[10px] font-bold text-white mt-1">
                                {idx + 1}
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full">
                                <div className="flex justify-between items-start">
                                    <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {doc.no_sk}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={10}/> {doc.tgl}
                                    </span>
                                </div>
                                <div className="text-xs font-medium text-gray-800 mt-1 truncate">
                                    {doc.pemrakarsa}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <div className="relative z-10 flex gap-3 items-start mt-6">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-200 flex items-center justify-center shrink-0 shadow text-white">
                        <ArrowRight size={12}/>
                    </div>
                    <div className="w-full">
                        <div className="text-sm font-bold text-blue-600">Dokumen Ini</div>
                        <p className="text-xs text-gray-500">
                           Akan menjadi entri terbaru
                        </p>
                    </div>
                </div>

            </div>
          </div>

        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition font-medium"
            >
                Batal
            </button>
            <button 
                onClick={handleSaveClick}
                disabled={isSubmitting || isDateInvalid || !tanggalPengolahan}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Sedang Menyimpan...' : (
                    <>
                        <Save size={18} /> Simpan & Generate Nomor
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}