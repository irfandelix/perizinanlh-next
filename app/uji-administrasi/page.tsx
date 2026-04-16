'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, Clock, Loader2, AlertCircle, ChevronRight, ExternalLink } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    nomorUjiBerkas?: string; 
    fileTahapB?: string; // TAMBAHAN: Menyimpan URL link Google Drive BA HUA
}

function UjiAdministrasiContent() {
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
                    
                    // Ambil daftar tahun unik
                    const yearsSet = new Set(docs.map((item: Dokumen) => 
                        item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString())
                    ));
                    
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
                    <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-100 italic">
                        <FileText className="text-white w-7 h-7" />
                    </div>
                    UJI ADMINISTRASI (TAHAP B)
                </h1>
                <p className="text-slate-400 mt-3 ml-20 text-xs font-black uppercase tracking-[0.2em]">Penerbitan Berita Acara Uji Administrasi (BA HUA)</p>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* FILTER TAHUN */}
                {availableYears.length > 0 && !loading && (
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {availableYears.map((year) => (
                            <button 
                                key={year} 
                                onClick={() => setSelectedYear(year)} 
                                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest border-2 transition-all ${
                                    selectedYear === year 
                                    ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-orange-200 hover:text-orange-600'
                                }`}
                            >
                                Tahun {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 text-orange-600">
                            <Loader2 className="animate-spin w-12 h-12 mb-4" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sinkronisasi Data...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-slate-300">
                            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-black uppercase text-xs tracking-widest">Kosong di tahun {selectedYear}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-50">
                                    <tr>
                                        <th className="p-6 w-20 text-center">No</th>
                                        <th className="p-6">Kegiatan & Dokumen</th>
                                        <th className="p-6">Pemrakarsa</th>
                                        <th className="p-6 text-center">Status BA</th>
                                        <th className="p-6 text-center w-52">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-orange-50/30 transition-all duration-200 group">
                                            <td className="p-6 text-center font-black text-slate-300 group-hover:text-orange-600">{doc.noUrut}</td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="inline-block w-fit px-2.5 py-0.5 rounded-md text-[9px] font-black bg-orange-50 text-orange-600 uppercase tracking-tighter border border-orange-100">
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
                                                {doc.nomorUjiBerkas ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Selesai BA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* TOMBOL LIHAT FILE DRIVE (Hanya muncul jika file ada) */}
                                                    {doc.fileTahapB && (
                                                        <a 
                                                            href={doc.fileTahapB} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all shadow-sm active:scale-95"
                                                            title="Buka BA HUA di Google Drive"
                                                        >
                                                            <ExternalLink size={14} /> File
                                                        </a>
                                                    )}

                                                    {/* TOMBOL PERIKSA / DETAIL */}
                                                    <Link 
                                                        href={`/uji-administrasi/${doc.noUrut}?thn=${doc.tahun || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear())}`} 
                                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                                            doc.nomorUjiBerkas 
                                                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-none' 
                                                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100'
                                                        }`}
                                                    >
                                                        {doc.nomorUjiBerkas ? 'Detail' : 'Periksa'}
                                                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </Link>
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

export default function UjiAdministrasiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin w-12 h-12 text-orange-600 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyiapkan Halaman...</p>
            </div>
        }>
            <UjiAdministrasiContent />
        </Suspense>
    );
}