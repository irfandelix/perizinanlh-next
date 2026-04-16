'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Search, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RisalahPengolahPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await fetch('/api/record/list');
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                    // Ambil daftar tahun unik dari data
                    const years = Array.from(new Set(result.data.map((d: any) => 
                        d.tahun?.toString() || d.tanggalMasukDokumen?.substring(0, 4)
                    ))).sort().reverse();
                    
                    setAvailableYears(years as string[]);
                    if (years.length > 0) setSelectedYear(years[0] as string);
                }
            } catch (err) { 
                console.error("Fetch error:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchDocs();
    }, []);

    const filteredData = data.filter((doc: any) => {
        const docYear = doc.tahun?.toString() || doc.tanggalMasukDokumen?.substring(0, 4);
        const matchesSearch = doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.namaPemrakarsa?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return docYear === selectedYear && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            {/* --- HEADER SECTION --- */}
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-rose-600 rounded-lg shadow-md italic">
                        <FileCheck className="text-white" />
                    </div>
                    RISALAH PENGOLAH DATA (RPD)
                </h1>
                <p className="text-slate-500 mt-2 ml-14 font-medium uppercase text-[10px] tracking-widest">
                    Tahap G: Finalisasi & Pengarsipan Digital Risalah Pengolahan Dokumen Lingkungan.
                </p>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* --- FILTERS SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {availableYears.map((y) => (
                            <button 
                                key={y} 
                                onClick={() => setSelectedYear(y)} 
                                className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                                    selectedYear === y 
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                                }`}
                            >
                                Tahun {y}
                            </button>
                        ))}
                    </div>
                    <div className="relative min-w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama kegiatan atau pemrakarsa..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 font-medium transition-all shadow-sm" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-rose-600 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin w-10 h-10" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Memuat Data Risalah...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <FileCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold uppercase text-xs tracking-widest">Tidak ada data untuk ditampilkan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-rose-50/50 text-rose-900 font-bold uppercase text-[10px] tracking-widest border-b border-rose-100">
                                    <tr>
                                        <th className="p-5 w-16 text-center">No</th>
                                        <th className="p-5">Kegiatan & No. Registrasi</th>
                                        <th className="p-5">Pemrakarsa</th>
                                        <th className="p-5 text-center">Status RPD</th>
                                        <th className="p-5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredData.map((doc: any) => (
                                        <tr key={doc._id} className="hover:bg-rose-50/10 transition-colors group">
                                            <td className="p-5 text-center font-bold text-slate-300 group-hover:text-rose-600">
                                                {doc.noUrut}
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-slate-800 uppercase line-clamp-1 leading-tight">
                                                    {doc.namaKegiatan || "(TANPA JUDUL)"}
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                                                    {doc.nomorChecklist || "Belum ada nomor"}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-xs font-bold text-slate-600 uppercase">
                                                    {doc.namaPemrakarsa || "-"}
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                {doc.nomorRisalah ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-tighter">
                                                        <FileCheck size={12} /> {doc.nomorRisalah}
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-tighter animate-pulse">
                                                        Belum Diproses
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* TOMBOL LIHAT FILE DRIVE (Baru ditambahkan) */}
                                                    {doc.fileTahapG && (
                                                        <a 
                                                            href={doc.fileTahapG} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                                            title="Buka PDF di Google Drive"
                                                        >
                                                            <ExternalLink size={14} /> File
                                                        </a>
                                                    )}

                                                    {/* TOMBOL MENU DETAIL */}
                                                    <button 
                                                        onClick={() => router.push(`/risalah-pengolah/${doc._id}`)} 
                                                        className="p-2 bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 group/btn"
                                                    >
                                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}