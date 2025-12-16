'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    tanggalMasukDokumen: string;
    jenisDokumen: string;
    nomorUjiBerkas?: string; // Syarat masuk tahap ini
    nomorBAVerlap?: string;  // Output tahap ini
}

export default function VerifikasiLapanganPage() {
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
                // FILTER LOGIC:
                // 1. Harus sudah punya Nomor Uji Berkas (Lulus Tahap B)
                // 2. Tampilkan yang belum Verlap (untuk diproses) ATAU yang sudah (untuk info)
                const filtered = result.data.filter((doc: any) => doc.nomorUjiBerkas);
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
                    <h1 className="text-2xl font-bold text-gray-800">Verifikasi Lapangan</h1>
                    <p className="text-gray-500 text-sm">Jadwal dan hasil peninjauan lokasi kegiatan (Tahap C).</p>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
                        <h3 className="font-bold text-green-800 flex items-center gap-2">
                            🌿 Daftar Verifikasi
                        </h3>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                            {dataDokumen.length} Dokumen
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3">No. Registrasi</th>
                                    <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                                    <th className="px-6 py-3">No. Uji Administrasi</th>
                                    <th className="px-6 py-3">Status Verlap</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Memuat data...</td></tr>
                                ) : dataDokumen.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada dokumen yang lolos administrasi.</td></tr>
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
                                                 <span className="font-mono text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">
                                                    {doc.nomorUjiBerkas}
                                                 </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {doc.nomorBAVerlap ? (
                                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 w-fit">
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span className="font-mono text-xs font-bold">{doc.nomorBAVerlap}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-orange-500 text-xs font-bold animate-pulse">
                                                        ● Menunggu Kunjungan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    href={`/verifikasi-lapangan/${doc.noUrut}`}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                                        doc.nomorBAVerlap
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                                >
                                                    <MapPin className="w-3 h-3" /> 
                                                    {doc.nomorBAVerlap ? 'Lihat Detail' : 'Input Hasil'}
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