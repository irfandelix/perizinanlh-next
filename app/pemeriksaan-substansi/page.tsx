'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    nomorBAVerlap?: string;     // Syarat masuk tahap ini
    nomorBAPemeriksaan?: string; // Output tahap ini
}

export default function PemeriksaanSubstansiPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/record/list'); 
            const result = await res.json();
            
            if (result.success) {
                // FILTER: Hanya yang sudah Verifikasi Lapangan (Punya No BA Verlap)
                const filtered = result.data.filter((doc: any) => doc.nomorBAVerlap);
                setDataDokumen(filtered);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Pemeriksaan Substansi</h1>
                    <p className="text-gray-500 text-sm">Rapat pembahasan dan penerbitan Berita Acara Pemeriksaan (Tahap D).</p>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                            📚 Daftar Pemeriksaan
                        </h3>
                        <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-1 rounded-full font-bold">
                            {dataDokumen.length} Dokumen
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3">No. Registrasi</th>
                                    <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                                    <th className="px-6 py-3">No. BA Pemeriksaan</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Memuat data...</td></tr>
                                ) : dataDokumen.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada dokumen siap diperiksa.</td></tr>
                                ) : (
                                    dataDokumen.map((doc, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-blue-600">
                                                {doc.nomorChecklist}
                                                <div className="text-xs text-gray-400 mt-1">{doc.jenisDokumen}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{doc.namaPemrakarsa}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{doc.namaKegiatan}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {doc.nomorBAPemeriksaan ? (
                                                    <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 w-fit">
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span className="font-mono text-xs font-bold">{doc.nomorBAPemeriksaan}</span>
                                                    </div>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-orange-500 text-xs font-bold animate-pulse">
                                                        <Clock className="w-3 h-3" /> Menunggu Rapat
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {doc.nomorBAVerlap ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                        <CheckCircle className="w-3 h-3" /> Selesai
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-orange-500 text-xs font-bold animate-pulse">
                                                        <Clock className="w-3 h-3" /> Menunggu Input
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    href={`/pemeriksaan-substansi/${doc.noUrut}`}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                                        doc.nomorBAPemeriksaan
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                    }`}
                                                >
                                                    <BookOpen className="w-3 h-3" /> 
                                                    {doc.nomorBAPemeriksaan ? 'Detail' : 'Input Hasil'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}