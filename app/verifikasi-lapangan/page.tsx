'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    nomorBAVerlap?: string;     
}

export default function VerifikasiLapanganPage() {
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
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="mb-8 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg shadow-md"><MapPin className="text-white w-6 h-6" /></div>
                    Verifikasi Lapangan (Tahap C)
                </h1>
                <p className="text-gray-500 mt-2 ml-14">Monitoring daftar kegiatan yang perlu/sudah dilakukan tinjauan lapangan.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                {availableYears.length > 0 && !loading && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {availableYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2 ${
                                    selectedYear === year ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-700'
                                }`}
                            >
                                Tahun {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-green-600">
                            <Loader2 className="animate-spin w-8 h-8 mb-2" /><span className="text-sm">Memuat daftar tinjauan lapangan...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                            <AlertCircle className="w-10 h-10 mb-3 opacity-50" /><p>Tidak ada dokumen terdaftar pada tahun {selectedYear}.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-green-50 text-green-900 font-semibold border-b border-green-100">
                                    <tr>
                                        <th className="p-4 w-16 text-center">No Urut</th>
                                        <th className="p-4">Jenis & Judul</th>
                                        <th className="p-4">Pemrakarsa</th>
                                        <th className="p-4">Status Lapangan</th>
                                        <th className="p-4 text-center w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-green-50/30 transition-colors">
                                            <td className="p-4 text-center font-mono text-gray-500 bg-gray-50/50">{doc.noUrut}</td>
                                            <td className="p-4">
                                                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 mb-1">{doc.jenisDokumen}</div>
                                                <div className="font-medium text-gray-800 line-clamp-2">{doc.namaKegiatan || "(Tanpa Judul)"}</div>
                                                <div className="font-mono text-xs text-gray-400 mt-1">{doc.nomorChecklist}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium">{doc.namaPemrakarsa || "-"}</td>
                                            <td className="p-4">
                                                {doc.nomorBAVerlap ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <CheckCircle className="w-3 h-3" /> Telah Ditinjau
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                                                        <Clock className="w-3 h-3" /> Menunggu Input
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link href={`/verifikasi-lapangan/${doc.noUrut}`} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${doc.nomorBAVerlap ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                                    <MapPin size={14} /> {doc.nomorBAVerlap ? 'Detail' : 'Input Hasil'}
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