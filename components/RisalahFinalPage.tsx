"use client";

import React, { useState } from 'react';
import { 
    Calendar, CheckCircle, History, AlertCircle, ArrowRight, Save, UploadCloud, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- DEFINISI TIPE DATA ---

export interface HistoryItem {
    no_sk: string;
    tgl: string; // Format YYYY-MM-DD
    pemrakarsa: string;
}

export interface CurrentDocData {
    _id: string; // Tambahkan ID untuk referensi DB
    pemrakarsa: string;
    no_registrasi: string;
    noUrut?: number;
}

interface RisalahFinalPageProps {
    riwayatDokumen: HistoryItem[];
    dataDokumen: CurrentDocData;
}

export default function RisalahFinalPage({ 
    riwayatDokumen = [], 
    dataDokumen 
}: RisalahFinalPageProps) {

    const router = useRouter();
    const [tanggalPengolahan, setTanggalPengolahan] = useState<string>('');
    const [file, setFile] = useState<File | null>(null); // State untuk file Drive
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
            // 1. Siapkan FormData (Wajib untuk upload file)
            const formData = new FormData();
            formData.append('noUrut', dataDokumen.noUrut?.toString() || "");
            formData.append('tanggalPembuatanRisalah', tanggalPengolahan);
            formData.append('namaPemrakarsa', dataDokumen.pemrakarsa);
            
            if (file) {
                formData.append('file', file);
            }

            // 2. Kirim ke API Tahap G (Risalah)
            const response = await fetch('/api/submit/g', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gagal menyimpan ke server");
            }
            
            alert(`Berhasil! Nomor RPD: ${result.generatedNomor}`);
            router.push('/risalah-pengolah'); // Redirect ke daftar risalah
            
        } catch (error: any) {
            console.error(error);
            alert("Gagal menyimpan data: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
            
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                
                {/* HEADER */}
                <div className="bg-emerald-600 p-8 text-white flex items-center gap-5">
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Finalisasi & Penomoran Risalah</h1>
                        <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest mt-1">
                            Tahap Akhir Pengolahan Dokumen Lingkungan Hidup
                        </p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* KOLOM KIRI: FORM INPUT */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informasi Dokumen</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-inner">
                                <div>
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pemrakarsa</label>
                                    <div className="font-bold text-slate-800 text-lg uppercase leading-tight">{dataDokumen.pemrakarsa}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">No. Registrasi</label>
                                    <div className="font-mono text-sm text-slate-500 font-bold">{dataDokumen.no_registrasi}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Input Tanggal */}
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                    Tanggal Terbit Risalah (RPD)
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={tanggalPengolahan}
                                        onChange={(e) => setTanggalPengolahan(e.target.value)}
                                        className={`w-full p-4 border-2 rounded-2xl font-bold transition-all outline-none ${
                                            isDateInvalid 
                                                ? 'border-red-200 bg-red-50 text-red-700' 
                                                : 'border-slate-100 bg-slate-50 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'
                                        }`}
                                    />
                                    <Calendar className={`absolute right-4 top-4 ${isDateInvalid ? 'text-red-400' : 'text-slate-400'}`} size={20} />
                                </div>

                                {isDateInvalid && (
                                    <div className="mt-3 flex items-start gap-2 text-red-600 text-[10px] font-black uppercase bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                                        <AlertCircle size={14} className="shrink-0"/>
                                        <span>Tanggal Backdate! Dokumen terakhir terbit pada {lastDate}.</span>
                                    </div>
                                )}
                            </div>

                            {/* Input File Drive */}
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <UploadCloud size={16} className="text-emerald-600"/> Upload Scan Risalah (PDF)
                                </label>
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer transition-all" 
                                />
                                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter italic">* File akan otomatis tersimpan ke folder pemrakarsa di Google Drive.</p>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN: HISTORY */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <History size={18} className="text-slate-400"/>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Referensi Terbit Terakhir</h3>
                        </div>
                        
                        <div className="space-y-4 relative">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>

                            {riwayatDokumen.length === 0 ? (
                                <div className="text-xs text-slate-300 font-bold uppercase pl-8 italic">Data kosong</div>
                            ) : (
                                riwayatDokumen.slice(0, 3).map((doc, idx) => (
                                    <div key={idx} className="relative z-10 flex gap-4 items-start group">
                                        <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-[10px] font-black text-slate-400 mt-1 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full group-hover:border-emerald-100 transition-all">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">
                                                    {doc.no_sk}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Calendar size={10}/> {doc.tgl}
                                                </span>
                                            </div>
                                            <div className="text-xs font-black text-slate-700 uppercase truncate">
                                                {doc.pemrakarsa}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            <div className="relative z-10 flex gap-4 items-start mt-6 opacity-50">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-200 flex items-center justify-center shrink-0 shadow text-white">
                                    <ArrowRight size={12}/>
                                </div>
                                <div className="w-full">
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Target Entry</div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Dokumen ini akan menjadi data terbaru</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* FOOTER BUTTONS */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSaveClick}
                        disabled={isSubmitting || isDateInvalid || !tanggalPengolahan}
                        className="px-10 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                        {isSubmitting ? 'Menyimpan...' : 'Simpan & Generate SK'}
                    </button>
                </div>

            </div>
        </div>
    );
}