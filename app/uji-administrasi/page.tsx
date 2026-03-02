'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, Clock, Loader2, AlertCircle, FileText } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    statusTerakhir: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string; // Dibutuhkan untuk filter tahun
    tahun?: string | number;
    nomorUjiBerkas?: string; 
}

export default function UjiAdministrasiPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk fitur Tab Tahun
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

                    // Logika ekstrak tahun dari data (Otomatis buat tab baru jika ada tahun baru)
                    const yearsSet = new Set(docs.map((item: Dokumen) => {
                        return item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString());
                    }));
                    
                    const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
                    setAvailableYears(yearsArray);
                    
                    if (yearsArray.length > 0) setSelectedYear(yearsArray[0]); // Default tahun terbaru
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter data berdasarkan tahun yang dipilih
    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
        return docYear === selectedYear;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mb-8 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg shadow-md"><FileText className="text-white w-6 h-6" /></div>
                    Uji Administrasi (Tahap B)
                </h1>
                <p className="text-gray-500 mt-2 ml-14">Verifikasi kelengkapan berkas awal dan penerbitan Berita Acara Uji Administrasi.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* --- UI TAB TAHUN --- */}
                {availableYears.length > 0 && !loading && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {availableYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2 ${
                                    selectedYear === year
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-700'
                                }`}
                            >
                                Tahun {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-orange-600">
                            <Loader2 className="animate-spin w-8 h-8 mb-2" /><span className="text-sm">Memuat dokumen uji...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                            <AlertCircle className="w-10 h-10 mb-3 opacity-50" /><p>Tidak ada dokumen terdaftar pada tahun {selectedYear}.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-orange-50 text-orange-900 font-semibold border-b border-orange-100">
                                    <tr>
                                        <th className="p-4 w-16 text-center">No Urut</th>
                                        <th className="p-4">Jenis & Judul</th>
                                        <th className="p-4">Pemrakarsa</th>
                                        <th className="p-4">Status Uji</th>
                                        <th className="p-4 text-center w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-orange-50/30 transition-colors">
                                            <td className="p-4 text-center font-mono text-gray-500 bg-gray-50/50">{doc.noUrut}</td>
                                            <td className="p-4">
                                                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 mb-1">{doc.jenisDokumen}</div>
                                                <div className="font-medium text-gray-800 line-clamp-2">{doc.namaKegiatan || "(Tanpa Judul)"}</div>
                                                <div className="font-mono text-xs text-gray-400 mt-1">{doc.nomorChecklist}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium">{doc.namaPemrakarsa || "-"}</td>
                                            <td className="p-4">
                                                {doc.nomorUjiBerkas ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <CheckCircle className="w-3 h-3" /> Selesai Uji
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                                                        <Clock className="w-3 h-3" /> Memeriksa...
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link href={`/uji-administrasi/${doc.noUrut}`} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${doc.nomorUjiBerkas ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
                                                    <Eye size={14} /> {doc.nomorUjiBerkas ? 'Detail' : 'Uji Berkas'}
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