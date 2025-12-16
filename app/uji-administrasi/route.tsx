'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    tanggalMasukDokumen: string;
    statusTerakhir: string;
    jenisDokumen: string;
}

export default function UjiAdministrasiPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mengambil daftar dokumen dari API list
            const res = await fetch('/api/record/list'); 
            const result = await res.json();
            
            if (result.success) {
                // Filter: Hanya tampilkan dokumen yang statusnya masih 'PROSES' (Baru masuk dari Tahap A)
                // Dokumen ini yang butuh Uji Administrasi (Tahap B)
                const filtered = result.data.filter((doc: any) => 
                    !doc.statusTerakhir || 
                    doc.statusTerakhir === 'PROSES' 
                );
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
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Uji Administrasi</h1>
                    <p className="text-gray-500 text-sm">Daftar dokumen yang menunggu verifikasi kelengkapan berkas (Tahap B).</p>
                </div>

                {/* Tabel Antrian */}
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-orange-50 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2">
                            📋 Antrian Dokumen
                        </h3>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                            {dataDokumen.length} Dokumen
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3">Tanggal Masuk</th>
                                    <th className="px-6 py-3">No. Registrasi</th>
                                    <th className="px-6 py-3">Pemrakarsa / Kegiatan</th>
                                    <th className="px-6 py-3">Jenis</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Memuat antrian...</td></tr>
                                ) : dataDokumen.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Tidak ada dokumen antrian.</td></tr>
                                ) : (
                                    dataDokumen.map((doc, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{doc.tanggalMasukDokumen}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-blue-600">{doc.nomorChecklist}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{doc.namaPemrakarsa}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{doc.namaKegiatan}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{doc.jenisDokumen}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {/* Tombol ini nanti akan memanggil API 'tahap-b' saat diklik di halaman detail */}
                                                <Link 
                                                    href={`/uji-administrasi/${doc.nomorChecklist.replace(/\//g, '-')}`}
                                                    className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all"
                                                >
                                                    <Eye className="w-3 h-3" /> Proses
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