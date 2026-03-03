'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, Search, CheckCircle2, XCircle, Loader2, FileSearch, Info } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaKegiatan: string;
    statusTerakhir: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    // Data untuk pengecekan otomatis
    nomorUjiBerkas?: string;
    nomorBAVerlap?: string;
    nomorBAPemeriksaan?: string;
    nomorPHP?: string;
    nomorRisalah?: string;
    tanggalPengembalian?: string;
    // Data Checklist Fisik (Arsip)
    arsipFisik?: {
        dokumenCetak: boolean;
        pkplhArsip: boolean;
        suratPermohonan: boolean;
        undanganSidang: boolean;
    };
}

export default function MenuArsipPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
                    const yearsSet = new Set(docs.map((item: Dokumen) => item.tahun?.toString() || item.tanggalMasukDokumen?.substring(0, 4)));
                    const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
                    setAvailableYears(yearsArray);
                    if (yearsArray.length > 0) setSelectedYear(yearsArray[0]);
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || doc.tanggalMasukDokumen?.substring(0, 4);
        return docYear === selectedYear && (
            doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Fungsi untuk menghitung persentase kelengkapan (dari 11 item)
    const calculateProgress = (doc: Dokumen) => {
        let count = 0;
        if (doc.arsipFisik?.dokumenCetak) count++; // 1
        if (doc.arsipFisik?.pkplhArsip) count++;   // 2
        if (doc.nomorUjiBerkas) count++;           // 3
        if (doc.nomorBAVerlap) count++;            // 4
        if (doc.nomorBAPemeriksaan) count++;       // 5
        if (doc.arsipFisik?.suratPermohonan) count++; // 6
        if (doc.nomorChecklist) count++;           // 7
        if (doc.tanggalPengembalian) count++;      // 8
        if (doc.nomorPHP) count++;                 // 9
        if (doc.arsipFisik?.undanganSidang) count++; // 10
        if (doc.nomorRisalah) count++;             // 11
        return Math.round((count / 11) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg shadow-md"><Archive className="text-white w-6 h-6" /></div>
                    Manajemen Arsip Dokumen
                </h1>
                <p className="text-slate-500 mt-2 ml-14 font-medium uppercase text-[10px] tracking-widest">Pusat kontrol validasi berkas fisik dan digital LH.</p>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {availableYears.map((y) => (
                            <button key={y} onClick={() => setSelectedYear(y)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${selectedYear === y ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>{y}</button>
                        ))}
                    </div>
                    <div className="relative min-w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Cari Berkas Arsip..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-100 outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center"><Loader2 className="animate-spin w-10 h-10 mx-auto text-slate-400" /></div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-5 w-16 text-center">No</th>
                                    <th className="p-5">Nama Kegiatan & Checklist</th>
                                    <th className="p-5 text-center">Progress Arsip</th>
                                    <th className="p-5 text-center w-32">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((doc) => {
                                    const progress = calculateProgress(doc);
                                    return (
                                        <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5 text-center font-bold text-slate-400">{doc.noUrut}</td>
                                            <td className="p-5">
                                                <div className="font-bold text-slate-800 uppercase line-clamp-1">{doc.namaKegiatan}</div>
                                                <div className="font-mono text-[10px] text-slate-400 mt-1">{doc.nomorChecklist}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                                                    <div className={`h-2.5 rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <div className="text-right text-[10px] font-black text-slate-500">{progress}% LENGKAP</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <Link href={`/arsip/${doc.noUrut}`} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all">
                                                    <FileSearch size={14} /> Periksa
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}