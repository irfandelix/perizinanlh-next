'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCheck, CheckCircle, Clock, Loader2, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    nomorRisalah?: string; 
    fileTahapG?: string; // TAMBAHAN: Menyimpan URL link Google Drive
}

export default function RisalahPengolahPage() {
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
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="mb-8 max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-rose-600 rounded-lg shadow-md italic"><FileCheck className="text-white w-6 h-6" /></div>
                    RISALAH PENGOLAH (TAHAP G)
                </h1>
                <p className="text-gray-500 mt-2 ml-14 text-xs font-bold uppercase tracking-widest">Tahap finalisasi dan penerbitan Berita Acara Risalah Pengolahan Dokumen.</p>
            </div>

            <div className="max-w-6xl mx-auto">
                {availableYears.length > 0 && !loading && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {availableYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                                    selectedYear === year ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-700'
                                }`}
                            >
                                Tahun {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 text-rose-600">
                            <Loader2 className="animate-spin w-10 h-10 mb-4" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sinkronisasi Data...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-gray-400">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-black text-xs uppercase tracking-widest text-center">Tidak ada dokumen terdaftar pada tahun {selectedYear}.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-rose-50/50 text-rose-900 font-black uppercase text-[10px] tracking-[0.2em] border-b border-rose-100">
                                    <tr>
                                        <th className="p-6 w-16 text-center">No</th>
                                        <th className="p-6">Kegiatan & No. Checklist</th>
                                        <th className="p-6">Pemrakarsa</th>
                                        <th className="p-6 text-center">Status RPD</th>
                                        <th className="p-6 text-center w-52">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-rose-50/20 transition-all duration-200 group">
                                            <td className="p-6 text-center font-black text-gray-300 group-hover:text-rose-600 bg-gray-50/30">{doc.noUrut}</td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-block w-fit px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 uppercase tracking-tighter">{doc.jenisDokumen}</span>
                                                    <div className="font-black text-gray-800 uppercase line-clamp-1 leading-tight">{doc.namaKegiatan || "(TANPA JUDUL)"}</div>
                                                    <div className="font-mono text-[10px] text-gray-400 mt-0.5 uppercase tracking-tighter">{doc.nomorChecklist}</div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-gray-500 font-bold text-xs uppercase italic">{doc.namaPemrakarsa || "-"}</td>
                                            <td className="p-6 text-center">
                                                {doc.nomorRisalah ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Selesai BA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-widest animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    
                                                    {/* TOMBOL LIHAT FILE DRIVE */}
                                                    {doc.fileTahapG && (
                                                        <a 
                                                            href={doc.fileTahapG} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all shadow-sm active:scale-95"
                                                            title="Buka PDF di Google Drive"
                                                        >
                                                            <ExternalLink size={14} /> File
                                                        </a>
                                                    )}

                                                    {/* TOMBOL DETAIL / INPUT */}
                                                    <Link 
                                                        href={`/verifikasi/${doc.noUrut}`} 
                                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                                                            doc.nomorRisalah 
                                                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none' 
                                                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                                                        }`}
                                                    >
                                                        {doc.nomorRisalah ? 'Detail' : 'Periksa'}
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