'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    nomorBAPemeriksaan?: string; 
}

// 1. Ubah komponen utama menjadi komponen internal (Content)
function PemeriksaanSubstansiContent() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                
                if (result.success) {
                    const docs = result.data;
                    setDataDokumen(docs);

                    const yearsSet = new Set(docs.map((item: Dokumen) => {
                        return item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString());
                    }));
                    
                    const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
                    setAvailableYears(yearsArray);
                    if (yearsArray.length > 0) setSelectedYear(yearsArray[0]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
        return docYear === selectedYear;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            <div className="mb-10 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 italic">
                        <BookOpen className="text-white w-7 h-7" />
                    </div>
                    PEMERIKSAAN SUBSTANSI (TAHAP D)
                </h1>
                <p className="text-slate-400 mt-3 ml-20 text-xs font-black uppercase tracking-[0.2em]">Rapat Pembahasan & Penerbitan Berita Acara Pemeriksaan</p>
            </div>

            <div className="max-w-6xl mx-auto">
                {availableYears.length > 0 && !loading && (
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {availableYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest border-2 transition-all ${
                                    selectedYear === year 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                            >
                                Tahun {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 text-indigo-600">
                            <Loader2 className="animate-spin w-12 h-12 mb-4" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sinkronisasi Data...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-slate-300">
                            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-black uppercase text-xs tracking-widest">Tidak ada dokumen di tahun {selectedYear}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-50">
                                    <tr>
                                        <th className="p-6 w-20 text-center">No</th>
                                        <th className="p-6">Kegiatan & Jenis Dokumen</th>
                                        <th className="p-6">Pemrakarsa</th>
                                        <th className="p-6 text-center">Status Rapat</th>
                                        <th className="p-6 text-center w-40">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                                            <td className="p-6 text-center font-black text-slate-300 group-hover:text-indigo-600">{doc.noUrut}</td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="inline-block w-fit px-2.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-50 text-indigo-600 uppercase tracking-tighter border border-indigo-100">
                                                        {doc.jenisDokumen}
                                                    </span>
                                                    <div className="font-black text-slate-800 uppercase line-clamp-1 leading-tight tracking-tight">
                                                        {doc.namaKegiatan || "(TANPA JUDUL)"}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-slate-400 tracking-tighter">
                                                        {doc.nomorChecklist || 'BELUM ADA NOMOR REGISTRASI'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-slate-500 font-bold text-xs uppercase italic">{doc.namaPemrakarsa || "-"}</td>
                                            <td className="p-6 text-center">
                                                {doc.nomorBAPemeriksaan ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Selesai BA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                <Link 
                                                    href={`/pemeriksaan-substansi/${doc._id}?thn=${doc.tahun}`} 
                                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                                        doc.nomorBAPemeriksaan 
                                                        ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                                                    }`}
                                                >
                                                    {doc.nomorBAPemeriksaan ? 'Detail' : 'Periksa'}
                                                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                </Link>
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

// 2. EXPORT UTAMA: Bungkus seluruh halaman ke dalam Suspense
export default function PemeriksaanSubstansiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyiapkan Halaman...</p>
            </div>
        }>
            <PemeriksaanSubstansiContent />
        </Suspense>
    );
}