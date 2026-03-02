'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, FileText, MapPin, BookOpen, 
    FileEdit, FileCheck, Loader2, ArrowRight, Activity, Clock, CalendarDays
} from 'lucide-react';

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    statusTerakhir: string;
    nomorUjiBerkas?: string; 
    nomorBAVerlap?: string;     
    nomorBAPemeriksaan?: string; 
    nomorPHP?: string;
    nomorRisalah?: string;
}

export default function DashboardPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total: 0,
        ujiAdmin: 0,
        verlap: 0,
        substansi: 0,
        revisi: 0,
        selesai: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                
                if (result.success) {
                    const docs: Dokumen[] = result.data;
                    
                    const sortedDocs = docs.sort((a, b) => b.noUrut - a.noUrut);
                    setDataDokumen(sortedDocs);

                    let ujiAdmin = 0, verlap = 0, substansi = 0, revisi = 0, selesai = 0;

                    docs.forEach(doc => {
                        if (doc.nomorRisalah) selesai++;
                        else if (doc.nomorBAPemeriksaan && !doc.nomorPHP) revisi++;
                        else if (doc.nomorBAVerlap && !doc.nomorBAPemeriksaan) substansi++;
                        else if (doc.nomorUjiBerkas && !doc.nomorBAVerlap) verlap++;
                        else if (!doc.nomorUjiBerkas) ujiAdmin++;
                    });

                    setStats({ total: docs.length, ujiAdmin, verlap, substansi, revisi, selesai });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, count, icon: Icon, colorClass, bgIconClass, link }: any) => (
        <Link href={link} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all group flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 group-hover:scale-105 transition-transform transform origin-left">{count}</h3>
            </div>
            <div className={`p-4 rounded-full ${bgIconClass} ${colorClass} transition-colors`}>
                <Icon size={26} strokeWidth={2.5} />
            </div>
        </Link>
    );

    // Data SOP / Batas Waktu Pelayanan
    const slaSteps = [
        { label: "Uji Administrasi", days: "3 Hari Kerja", color: "bg-orange-500", border: "border-orange-500" },
        { label: "Penjadwalan Rapat/Verlap", days: "5 Hari Kerja", color: "bg-green-500", border: "border-green-500" },
        { label: "Perbaikan oleh Pemrakarsa", days: "5 Hari Kerja", color: "bg-yellow-500", border: "border-yellow-500" },
        { label: "Pasca Sidang & Masukan", days: "5 Hari Kerja", color: "bg-indigo-500", border: "border-indigo-500" },
        { label: "Penyusunan RPD", days: "5 Hari Kerja", color: "bg-blue-500", border: "border-blue-500" },
        { label: "Penerbitan PKPLH", days: "5 Hari Kerja", color: "bg-emerald-500", border: "border-emerald-500" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Menyiapkan Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
            
            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
                            <LayoutDashboard className="text-white w-6 h-6" />
                        </div>
                        Dashboard Perizinan
                    </h1>
                    <p className="text-gray-500 mt-2 ml-14 font-medium">
                        Ringkasan aktivitas dan status dokumen lingkungan hidup terkini.
                    </p>
                </div>
                <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Activity size={18} className="text-blue-500" />
                    Total {stats.total} Dokumen Terdaftar
                </div>
            </div>

            {/* METRIK STATISTIK GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                <StatCard title="Uji Admin" count={stats.ujiAdmin} icon={FileText} link="/uji-administrasi" colorClass="text-orange-600" bgIconClass="bg-orange-50 group-hover:bg-orange-100" />
                <StatCard title="Verifikasi Lpg" count={stats.verlap} icon={MapPin} link="/verifikasi-lapangan" colorClass="text-green-600" bgIconClass="bg-green-50 group-hover:bg-green-100" />
                <StatCard title="Pemeriksaan" count={stats.substansi} icon={BookOpen} link="/pemeriksaan-substansi" colorClass="text-indigo-600" bgIconClass="bg-indigo-50 group-hover:bg-indigo-100" />
                <StatCard title="Revisi" count={stats.revisi} icon={FileEdit} link="/pemeriksaan-revisi" colorClass="text-blue-600" bgIconClass="bg-blue-50 group-hover:bg-blue-100" />
                <StatCard title="Selesai / RPD" count={stats.selesai} icon={FileCheck} link="/risalah-pengolah" colorClass="text-rose-600" bgIconClass="bg-rose-50 group-hover:bg-rose-100" />
            </div>

            {/* BAGIAN BAWAH: TABEL & TIMELINE */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* KIRI: TABEL DOKUMEN TERBARU (Porsi lebih lebar) */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="text-blue-500" size={20} /> Aktivitas Dokumen Terbaru
                        </h3>
                        <Link href="/rekap" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                            Lihat Semua <ArrowRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="p-4 w-16 text-center">No</th>
                                    <th className="p-4">Tanggal Masuk</th>
                                    <th className="p-4">Nama Kegiatan</th>
                                    <th className="p-4">Jenis</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dataDokumen.slice(0, 6).map((doc) => (
                                    <tr key={doc._id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 text-center font-bold text-gray-600">{doc.noUrut}</td>
                                        <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{doc.tanggalMasukDokumen}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 line-clamp-1">{doc.namaKegiatan || "(Tanpa Judul)"}</div>
                                            <div className="font-mono text-[11px] text-gray-400 mt-0.5">{doc.namaPemrakarsa}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-extrabold tracking-wide whitespace-nowrap">
                                                {doc.jenisDokumen}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-bold whitespace-nowrap">
                                                {doc.statusTerakhir || 'PROSES'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {dataDokumen.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                                            Belum ada dokumen yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KANAN: TIMELINE SOP BATAS WAKTU */}
                <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
                        <CalendarDays className="text-indigo-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">SOP Batas Waktu</h3>
                    </div>
                    
                    <div className="p-6 flex-1 bg-white">
                        <p className="text-xs text-gray-500 font-medium mb-6">
                            Pengingat alur dan batas maksimal penyelesaian dokumen lingkungan sesuai regulasi.
                        </p>

                        <div className="relative pl-3">
                            {/* Garis Vertikal Timeline */}
                            <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-gray-100"></div>

                            <ul className="space-y-5 relative">
                                {slaSteps.map((step, index) => (
                                    <li key={index} className="flex gap-4 items-start relative">
                                        {/* Dot Indikator */}
                                        <div className={`w-3 h-3 mt-1.5 rounded-full z-10 ring-4 ring-white shrink-0 ${step.color}`}></div>
                                        
                                        {/* Konten Timeline */}
                                        <div className={`flex-1 border border-gray-100 bg-white p-3 rounded-xl shadow-sm border-l-4 ${step.border} hover:shadow-md transition-shadow`}>
                                            <h4 className="text-sm font-bold text-gray-800">{step.label}</h4>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <Clock size={12} className="text-red-500" />
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                                    {step.days}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}