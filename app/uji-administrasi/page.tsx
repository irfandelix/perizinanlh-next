'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, FileText } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    tanggalMasukDokumen: string;
    statusTerakhir: string;
    statusVerifikasi?: string;
    jenisDokumen: string;
    nomorUjiBerkas?: string; // <--- Field Baru untuk Hasil
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
            const res = await fetch('/api/record/list'); 
            const result = await res.json();
            
            if (result.success) {
                // Filter: Tampilkan PROSES (Belum ada BA) atau DIPERIKSA (Sudah ada BA tapi belum selesai total)
                // Sesuaikan logika ini dengan kebutuhan Anda
                const filtered = result.data.filter((doc: any) => {
                    const st = doc.statusTerakhir;
                    // Kita tampilkan semua agar terlihat mana yang sudah punya No. BA dan mana yang belum
                    return !st || st === 'PROSES' || st === 'BARU' || st === 'DITERIMA'; 
                });
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
                    <h1 className="text-2xl font-bold text-gray-800">Uji Administrasi</h1>
                    <p className="text-gray-500 text-sm">Verifikasi kelengkapan berkas dan penerbitan Berita Acara.</p>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-orange-50 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2">
                            📋 Daftar Dokumen
                        </h3>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                            {dataDokumen.length} Dokumen
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">No. Registrasi</th>
                                    <th className="px-6 py-3">Pemrakarsa</th>
                                    {/* KOLOM BARU UNTUK HASIL */}
                                    <th className="px-6 py-3">Hasil (No. BA)</th> 
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Memuat data...</td></tr>
                                ) : dataDokumen.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Tidak ada data.</td></tr>
                                ) : (
                                    dataDokumen.map((doc, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{doc.tanggalMasukDokumen}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-blue-600">
                                                {doc.nomorChecklist}
                                                <div className="text-xs text-gray-400 mt-1">{doc.jenisDokumen}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{doc.namaPemrakarsa}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{doc.namaKegiatan}</div>
                                            </td>
                                            
                                            {/* MENAMPILKAN HASIL (NOMOR UJI BERKAS) */}
                                            <td className="px-6 py-4">
                                                {doc.nomorUjiBerkas ? (
                                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 w-fit">
                                                        <FileText className="w-3 h-3" />
                                                        <span className="font-mono text-xs font-bold">{doc.nomorUjiBerkas}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">- Belum Terbit -</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    href={`/uji-administrasi/${doc.noUrut}`}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                                        doc.nomorUjiBerkas 
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300' 
                                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                    }`}
                                                >
                                                    <Eye className="w-3 h-3" /> 
                                                    {doc.nomorUjiBerkas ? 'Detail' : 'Proses'}
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