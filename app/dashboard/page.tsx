'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Calendar, FileText, CheckCircle, Clock, AlertTriangle, Download, ArrowRight, Leaf } from 'lucide-react';

export default function DashboardUIPreview() {
  const [selectedYear, setSelectedYear] = useState('2025');

  // --- DATA DUMMY (WARNA SUDAH DISERAGAMKAN: HIJAU & ORANYE) ---
  const stats = [
    // Dokumen Masuk: Ganti Blue -> Emerald (Hijau Segar)
    { label: "Dokumen Masuk", value: 150, icon: FileText, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    // Sedang Proses: Tetap Oranye
    { label: "Sedang Proses", value: 45, icon: Clock, bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    // Selesai: Tetap Hijau
    { label: "Selesai (Izin Terbit)", value: 85, icon: CheckCircle, bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
    // Dikembalikan: Merah (Standar Error/Warning)
    { label: "Dikembalikan", value: 20, icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  ];

  const docTypes = [
    { label: 'SPPL', count: 80, percent: 60, color: 'bg-green-500' }, // Hijau
    { label: 'UKL-UPL', count: 45, percent: 35, color: 'bg-orange-500' }, // Oranye
    { label: 'AMDAL', count: 5, percent: 10, color: 'bg-emerald-600' }, // Ganti Blue -> Emerald
    { label: 'DELH', count: 10, percent: 15, color: 'bg-lime-500' }, // Lime (Hijau Muda)
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-6 md:p-8">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-green-800 tracking-tight flex items-center gap-2">
            <Leaf className="text-orange-500" size={28} />
            Dashboard Monitoring
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sistem Informasi Pelayanan Dokumen Lingkungan Hidup Kab. Sragen</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {/* Filter Tahun */}
            <div className="relative inline-block text-left">
                <select 
                    className="
                        bg-white 
                        border border-slate-200 
                        text-slate-700 
                        font-semibold 
                        py-1.5 
                        pl-3 pr-8 // Ruang untuk panah
                        rounded-xl 
                        shadow-sm 
                        appearance-none // Hapus panah default browser
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-green-500/50 
                        transition duration-150
                        cursor-pointer
                    "
                    defaultValue="2025" // Atau state yang sesuai
                >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>
                
                {/* Ikon Panah Kustom (Penting karena kita menghilangkan appearance-none) */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Notifikasi */}
            <div className="p-2 bg-orange-50 rounded-lg relative cursor-pointer hover:bg-orange-100 transition text-orange-600">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
            </div>
            
            {/* Search */}
            <div className="p-2 text-slate-400 hover:text-green-600 cursor-pointer">
                <Search size={20} />
            </div>
        </div>
      </header>

      {/* --- QUICK STATS GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
            <div key={index} className={`bg-white p-6 rounded-2xl border ${item.border} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${item.bg}`}>
                        <item.icon className={`w-6 h-6 ${item.text}`} />
                    </div>
                </div>
                <h3 className="text-4xl font-extrabold text-slate-800 mb-1">{item.value}</h3>
                <p className="text-slate-500 text-sm font-medium">{item.label}</p>
            </div>
        ))}
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: MENU CEPAT (2/3 Lebar) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Action Cards */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <span className="w-1 h-6 bg-orange-500 rounded-full mr-3"></span>
                    Menu Cepat
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. PENYERAHAN KEMBALI (Ganti Blue -> Orange/Green) */}
                    <Link href="/pengembalian" className="group">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition">
                                <ArrowRight className="text-orange-500 w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-orange-700">Penyerahan Kembali</h4>
                                <p className="text-xs text-slate-500">Kembalikan ke Pemrakarsa</p>
                            </div>
                        </div>
                    </Link>

                    {/* 2. INPUT PHP (Green) */}
                    <Link href="/penerimaan" className="group">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition">
                                <FileText className="text-green-600 w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-green-700">Input PHP</h4>
                                <p className="text-xs text-slate-500">Penerimaan Hasil Perbaikan</p>
                            </div>
                        </div>
                    </Link>

                    {/* 3. REKAP DATA (Ganti Blue -> Emerald) */}
                    <Link href="/rekap" className="group">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition">
                                <Download className="text-emerald-600 w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-700">Rekap Data</h4>
                                <p className="text-xs text-slate-500">Download Laporan Excel</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Statistik Bulanan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                 <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-1 h-6 bg-green-600 rounded-full mr-3"></span>
                        Statistik Bulanan
                    </div>
                </h3>
                
                <div className="flex items-end justify-between gap-4 h-48 pt-4 border-b border-slate-100 pb-2">
                    {[40, 65, 30, 80, 55, 90, 45, 70].map((h, i) => (
                        <div key={i} className="w-full flex flex-col items-center gap-2 group">
                             <div className="w-full bg-slate-100 rounded-t-lg h-full relative overflow-hidden">
                                <div 
                                    style={{ height: `${h}%` }} 
                                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ${
                                        i % 2 === 0 ? 'bg-gradient-to-t from-green-600 to-green-400' : 'bg-orange-400'
                                    } group-hover:opacity-80`}
                                ></div>
                             </div>
                             <span className="text-xs text-slate-400">M{i+1}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* KOLOM KANAN: JENIS DOKUMEN */}
        <div className="lg:col-span-1">
             <div className="bg-white rounded-3xl p-8 border border-slate-200 h-full shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Jenis Dokumen</h3>
                
                <div className="space-y-6">
                    {docTypes.map((type, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-slate-600">{type.label}</span>
                                <span className="font-bold text-slate-800">{type.count} Dok</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${type.color}`} 
                                    style={{ width: `${type.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner Bantuan */}
                <div className="mt-10 p-6 bg-linear-to-br from-green-700 to-emerald-900 rounded-2xl relative overflow-hidden text-white shadow-lg">
                    <Leaf className="absolute -bottom-4 -right-4 text-green-500/30 w-32 h-32" />
                    <h4 className="text-lg font-bold mb-2 relative z-10">Butuh Bantuan?</h4>
                    <p className="text-xs text-green-100 mb-4 relative z-10">
                        Hubungi tim IT DLH jika terdapat kendala sistem.
                    </p>
                    <button className="w-full py-2 bg-white text-green-800 font-bold text-sm rounded-xl hover:bg-orange-100 transition relative z-10">
                        Hubungi Support
                    </button>
                </div>
            </div>
        </div>

      </section>

      <footer className="mt-12 text-center text-slate-400 text-xs pb-6">
        &copy; {new Date().getFullYear()} Dinas Lingkungan Hidup Kab. Sragen
      </footer>
    </div>
  );
}