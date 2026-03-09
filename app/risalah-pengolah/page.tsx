'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Search, ChevronRight, Loader2, Calendar } from 'lucide-react';
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
                    const years = Array.from(new Set(result.data.map((d: any) => d.tahun?.toString() || d.tanggalMasukDokumen?.substring(0, 4)))).sort().reverse();
                    setAvailableYears(years as string[]);
                    if (years.length > 0) setSelectedYear(years[0] as string);
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchDocs();
    }, []);

    const filteredData = data.filter((doc: any) => {
        const docYear = doc.tahun?.toString() || doc.tanggalMasukDokumen?.substring(0, 4);
        const matchesSearch = doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase());
        return docYear === selectedYear && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-rose-600 rounded-lg shadow-md"><FileCheck className="text-white" /></div>
                    Risalah Pengolah Data (RPD)
                </h1>
                <p className="text-slate-500 mt-2 ml-14 font-medium uppercase text-[10px] tracking-widest">Tahap G: Finalisasi Risalah Pengolahan Dokumen Lingkungan.</p>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {availableYears.map((y) => (
                            <button key={y} onClick={() => setSelectedYear(y)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${selectedYear === y ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>{y}</button>
                        ))}
                    </div>
                    <div className="relative min-w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Cari dokumen..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 font-medium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-rose-600"><Loader2 className="animate-spin mx-auto w-10 h-10" /></div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-rose-50 text-rose-900 font-bold uppercase text-[10px] tracking-wider border-b border-rose-100">
                                <tr>
                                    <th className="p-5 w-16 text-center">No</th>
                                    <th className="p-5">Kegiatan & No. Registrasi</th>
                                    <th className="p-5">Status RPD</th>
                                    <th className="p-5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((doc: any) => (
                                    <tr key={doc._id} className="hover:bg-rose-50/20 transition-colors">
                                        <td className="p-5 text-center font-bold text-slate-400">{doc.noUrut}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-slate-800 uppercase line-clamp-1">{doc.namaKegiatan}</div>
                                            <div className="text-[10px] font-mono text-slate-400 mt-1">{doc.nomorChecklist}</div>
                                        </td>
                                        <td className="p-5">
                                            {doc.nomorRisalah ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                                                    <FileCheck size={12} /> Selesai: {doc.nomorRisalah}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase">
                                                    Belum Diproses
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-center">
                                            <button onClick={() => router.push(`/risalah-pengolah/${doc._id}`)} className="p-2 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-xl transition-all group">
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}