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
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                {/* Kolom Pemrakarsa: Diberi lebar fleksibel */}
                                <th scope="col" className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                                
                                {/* Kolom Nomor: Diberi whitespace-nowrap di header juga */}
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Dasar (No. Verlap)</th>
                                
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">No. BA Pemeriksaan</th>
                                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                <tr className="bg-white border-b hover:bg-gray-50">
                                
                                {/* --- BAGIAN PEMRAKARSA (Boleh Dipotong/Turun) --- */}
                                <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                                    <div className="font-bold text-gray-900">PT. CAHAYA MAKMUR SEKALI</div>
                                    <div className="text-gray-500 mt-1">
                                        Pembangunan Gudang Penyimpanan Barang Bekas dan Daur Ulang di Kawasan Industri...
                                    </div>
                                </td>

                                {/* --- BAGIAN NOMOR (JANGAN DIPOTONG) --- */}
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    600.4/067.12/17/BA.V.UKLUPL/2025
                                </td>

                                {/* Kolom Status (Biasanya satu baris juga) */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-orange-500 flex items-center gap-1">
                                    🕐 Menunggu Rapat
                                    </span>
                                </td>

                                {/* Kolom Aksi */}
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button className="bg-blue-600 text-white px-3 py-2 rounded-md">
                                    Input Hasil
                                    </button>
                                </td>
                                
                                </tr>
                            </tbody>
                            </table>
                    </div>
                </div>
            </div>
        </div>
    );
}