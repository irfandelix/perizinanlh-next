'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    nomorBAVerlap?: string;     
    nomorBAPemeriksaan?: string; 
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
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            
            {/* HEADER HALAMAN */}
            <div className="mb-8 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    Pemeriksaan Substansi (Tahap D)
                </h1>
                <p className="text-gray-500 mt-2 ml-14">
                    Rapat pembahasan dan penerbitan Berita Acara Pemeriksaan Dokumen Lingkungan.
                </p>
            </div>

            {/* KONTEN UTAMA */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {loading ? (
                    // LOADING STATE
                    <div className="flex flex-col items-center justify-center p-12 text-indigo-600">
                        <Loader2 className="animate-spin w-8 h-8 mb-2" />
                        <span className="text-sm">Memuat daftar pemeriksaan...</span>
                    </div>
                ) : dataDokumen.length === 0 ? (
                    // EMPTY STATE (KOSONG)
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                        <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                        <p>Belum ada dokumen yang siap diperiksa substansi.</p>
                    </div>
                ) : (
                    // TABEL DATA
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-indigo-50 text-indigo-900 font-semibold border-b border-indigo-100">
                                <tr>
                                    <th className="p-4 w-16 text-center">No Urut</th>
                                    <th className="p-4">Jenis & Judul</th>
                                    <th className="p-4">Pemrakarsa</th>
                                    <th className="p-4">Status Rapat</th>
                                    <th className="p-4 text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dataDokumen.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-4 text-center font-mono text-gray-500 bg-gray-50/50">
                                            {doc.noUrut}
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 mb-1">
                                                {doc.jenisDokumen}
                                            </div>
                                            <div className="font-medium text-gray-800 line-clamp-2">
                                                {doc.namaKegiatan || "(Tanpa Judul)"}
                                            </div>
                                            <div className="font-mono text-xs text-gray-400 mt-1">{doc.nomorChecklist}</div>
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {doc.namaPemrakarsa || "-"}
                                        </td>
                                        <td className="p-4">
                                            {doc.nomorBAPemeriksaan ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <CheckCircle className="w-3 h-3" /> Selesai BA
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                                                    <Clock className="w-3 h-3" /> Menunggu
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link 
                                                href={`/pemeriksaan-substansi/${doc.noUrut}`} 
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
                                                    doc.nomorBAPemeriksaan 
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                            >
                                                <BookOpen size={14} /> {doc.nomorBAPemeriksaan ? 'Detail' : 'Periksa'}
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
    );
}