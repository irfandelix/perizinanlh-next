'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle, Clock, Loader2, AlertCircle, Search } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    statusTerakhir: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    nomorPHP?: string; 
}

export default function PenerimaanHasilPerbaikanPage() {
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
        const matchesYear = docYear === selectedYear;
        const matchesSearch = doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesYear && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mb-8 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                        <ClipboardList className="text-white w-6 h-6" />
                    </div>
                    Penerimaan Hasil Perbaikan
                </h1>
                <p className="text-gray-500 mt-2 ml-14">Mencatat dokumen revisi yang telah diperbaiki dan diserahkan kembali oleh pemrakarsa.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {availableYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2 ${
                                    selectedYear === year ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    <div className="relative min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari Dokumen..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-purple-600">
                            <Loader2 className="animate-spin w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Memuat data perbaikan...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-purple-50 text-purple-900 font-bold border-b border-purple-100">
                                    <tr>
                                        <th className="p-4 w-16 text-center">No</th>
                                        <th className="p-4">Nama Kegiatan</th>
                                        <th className="p-4">Pemrakarsa</th>
                                        <th className="p-4">Status PHP</th>
                                        <th className="p-4 text-center w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="p-4 text-center font-mono text-gray-400 font-bold">{doc.noUrut}</td>
                                            <td className="p-4">
                                                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-700 mb-1.5 uppercase">{doc.jenisDokumen}</div>
                                                <div className="font-bold text-gray-800 line-clamp-1 uppercase">{doc.namaKegiatan || "(Tanpa Judul)"}</div>
                                                <div className="font-mono text-[11px] text-gray-400 mt-1">{doc.nomorChecklist}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium">{doc.namaPemrakarsa || "-"}</td>
                                            <td className="p-4">
                                                {doc.nomorPHP ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle className="w-3.5 h-3.5" /> DITERIMA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> MENUNGGU
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link 
                                                    href={`/penerimaan/${doc.noUrut}`} 
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                                        doc.nomorPHP ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300' : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                    }`}
                                                >
                                                    <ClipboardList size={14} /> {doc.nomorPHP ? 'Detail' : 'Terima'}
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