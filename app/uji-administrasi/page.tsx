'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react'; 

interface Dokumen {
    _id: string;
    noUrut: number;        // <--- TAMBAHKAN BARIS INI
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    tanggalMasukDokumen: string;
    statusTerakhir: string;
    statusVerifikasi?: string; // Tambahkan ini
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
            const res = await fetch('/api/record/list'); 
            const result = await res.json();
            
            // --- DEBUGGING: LIHAT DATA DI CONSOLE BROWSER (F12) ---
            console.log("🔥 DATA MENTAH DARI API:", result.data);

            if (result.success) {
                // FILTER DIPERLUAS:
                // Masukkan jika statusnya: Kosong, PROSES, BARU, atau Diterima
                const filtered = result.data.filter((doc: any) => {
                    const st = doc.statusTerakhir;
                    const sv = doc.statusVerifikasi;
                    
                    // Cek berbagai kemungkinan status awal
                    return !st || 
                           st === 'PROSES' || 
                           st === 'BARU' || 
                           st === 'DITERIMA' ||
                           st === 'Diterima' || 
                           // Cek juga statusVerifikasi dari form registrasi
                           (sv === 'Diterima' && (!st || st === 'PROSES')); 
                });

                console.log("✅ DATA SETELAH FILTER:", filtered);
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
                    <p className="text-gray-500 text-sm">Daftar dokumen yang menunggu verifikasi kelengkapan berkas (Tahap B).</p>
                </div>

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
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Memuat data...</td></tr>
                                ) : dataDokumen.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            Tidak ada dokumen antrian.<br/>
                                            <span className="text-xs italic">(Cek Console F12 jika yakin data ada)</span>
                                        </td>
                                    </tr>
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
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">
                                                    {doc.statusTerakhir || doc.statusVerifikasi || 'BARU'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    // GANTI BARIS INI: Gunakan doc.noUrut langsung
                                                    href={`/uji-administrasi/${doc.noUrut}`} 
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