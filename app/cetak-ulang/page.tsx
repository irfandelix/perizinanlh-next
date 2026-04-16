'use client';

import React, { useState, useEffect } from 'react';
import { 
    Printer, Search, ChevronDown, FileText, 
    ClipboardCheck, FileCheck, Loader2, ChevronRight, ExternalLink
} from 'lucide-react';

// --- IMPORT PDF COMPONENTS ---
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ChecklistPrintTemplate } from '@/components/pdf/ChecklistPrintTemplate';
import { TandaTerimaPDF } from '@/components/pdf/TandaTerimaPDF';
import { TandaTerimaPDF_PHP } from '@/components/pdf/TandaTerimaPDF_PHP';

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    tahun?: string | number;
    statusVerifikasi?: string;
    checklistStatus?: any; // Mengikuti struktur data di database
    // Data Tahapan
    nomorUjiBerkas?: string;
    nomorBAVerlap?: string;
    nomorBAPemeriksaan?: string;
    nomorPHP?: string;
    nomorRevisi?: string;
    // Drive Links (Untuk referensi jika ingin akses langsung)
    fileTahapA_Checklist?: string;
    fileTahapA_TandaTerima?: string;
    fileTahapG?: string;
}

export default function CetakUlangPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        setIsClient(true);
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
                console.error("Fetch error:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, []);

    const getFileName = (prefix: string, recordData: any) => {
        const safeName = recordData.namaPemrakarsa?.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
        return `${prefix.toUpperCase()}_${recordData.noUrut}_${safeName}.pdf`;
    };

    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
        const matchesYear = docYear === selectedYear;
        const matchesSearch = doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.namaPemrakarsa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesYear && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            {/* HEADER */}
            <div className="mb-10 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                    <div className="p-3 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-100">
                        <Printer className="text-white w-7 h-7" />
                    </div>
                    PUSAT CETAK ULANG
                </h1>
                <p className="text-slate-400 mt-3 ml-20 text-xs font-black uppercase tracking-[0.2em]">
                    Cetak kembali arsip registrasi dan tanda terima dinas.
                </p>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* TABS & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {availableYears.map((year) => (
                            <button 
                                key={year} 
                                onClick={() => setSelectedYear(year)}
                                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all border-2 ${
                                    selectedYear === year 
                                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-100' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-cyan-200 hover:text-cyan-600'
                                }`}
                            > 
                                Tahun {year} 
                            </button>
                        ))}
                    </div>
                    <div className="relative min-w-[350px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari Kegiatan atau Pemrakarsa..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-50 transition-all font-medium shadow-sm"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 text-cyan-600">
                            <Loader2 className="animate-spin w-12 h-12 mb-4" />
                            <span className="font-black text-xs uppercase tracking-widest text-slate-400">Sinkronisasi Dokumen...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-slate-300">
                            <FileCheck size={64} className="mb-4 opacity-10" />
                            <p className="font-black uppercase text-xs tracking-widest">Tidak ada dokumen di tahun {selectedYear}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50/50 text-slate-400 font-black border-b border-slate-50 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="p-6 w-20 text-center">No</th>
                                        <th className="p-6">Informasi Dokumen</th>
                                        <th className="p-6">Pemrakarsa</th>
                                        <th className="p-6 text-center">Aksi Cetak</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((doc) => {
                                        const hasPHP = !!(doc.nomorPHP);
                                        return (
                                            <tr key={doc._id} className="hover:bg-cyan-50/20 transition-all group">
                                                <td className="p-6 text-center font-black text-slate-300 group-hover:text-cyan-600 transition-colors">
                                                    {doc.noUrut}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-block w-fit px-2.5 py-0.5 rounded-md text-[9px] font-black bg-cyan-50 text-cyan-600 uppercase tracking-tighter border border-cyan-100">
                                                            {doc.jenisDokumen}
                                                        </span>
                                                        <div className="font-black text-slate-800 uppercase line-clamp-1 group-hover:text-cyan-900 transition-colors tracking-tight">
                                                            {doc.namaKegiatan}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
                                                            {doc.nomorChecklist}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-slate-500 font-bold text-xs uppercase italic">
                                                    {doc.namaPemrakarsa}
                                                </td>
                                                <td className="p-6 text-center relative">
                                                    <button 
                                                        onClick={() => setOpenDropdown(openDropdown === doc._id ? null : doc._id)}
                                                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                                                            openDropdown === doc._id 
                                                            ? 'bg-cyan-600 text-white' 
                                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-400'
                                                        }`}
                                                    > 
                                                        <Printer size={14} /> Opsi Cetak <ChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === doc._id ? 'rotate-180' : ''}`} /> 
                                                    </button>

                                                    {/* DROPDOWN MENU */}
                                                    {openDropdown === doc._id && isClient && (
                                                        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200 text-left overflow-hidden">
                                                            <p className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Pilih Jenis Berkas</p>
                                                            
                                                            {/* OPSI 1: CHECKLIST */}
                                                            <PDFDownloadLink
                                                                document={<ChecklistPrintTemplate data={doc} checklistStatus={doc.checklistStatus || []} statusVerifikasi={doc.statusVerifikasi || "DITERIMA"} />}
                                                                fileName={getFileName('CHECKLIST', doc)}
                                                            >
                                                                {/* @ts-ignore */}
                                                                {({ loading: pdfLoading }) => (
                                                                    <div className="px-5 py-3 text-[11px] font-black text-slate-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer transition-colors uppercase tracking-tight">
                                                                        <FileText size={16} className="text-cyan-500" /> 
                                                                        <div className="flex-1">Checklist Kelengkapan</div>
                                                                        {pdfLoading ? <Loader2 size={14} className="animate-spin text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
                                                                    </div>
                                                                )}
                                                            </PDFDownloadLink>

                                                            {/* OPSI 2: TANDA TERIMA AWAL */}
                                                            <PDFDownloadLink
                                                                document={<TandaTerimaPDF data={doc} />}
                                                                fileName={getFileName('TANDA_TERIMA', doc)}
                                                            >
                                                                {/* @ts-ignore */}
                                                                {({ loading: pdfLoading }) => (
                                                                    <div className="px-5 py-3 text-[11px] font-black text-slate-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer transition-colors uppercase tracking-tight">
                                                                        <ClipboardCheck size={16} className="text-emerald-500" /> 
                                                                        <div className="flex-1">Tanda Terima (A)</div>
                                                                        {pdfLoading ? <Loader2 size={14} className="animate-spin text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
                                                                    </div>
                                                                )}
                                                            </PDFDownloadLink>

                                                            {/* OPSI 3: PHP (Jika Sudah Lewat Tahap F) */}
                                                            {hasPHP && (
                                                                <PDFDownloadLink
                                                                    document={<TandaTerimaPDF_PHP data={doc} />}
                                                                    fileName={getFileName('TANDA_TERIMA_PHP', doc)}
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    {({ loading: pdfLoading }) => (
                                                                        <div className="px-5 py-3 text-[11px] font-black text-slate-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer transition-colors uppercase tracking-tight border-t border-slate-50 mt-1">
                                                                            <FileCheck size={16} className="text-orange-500" /> 
                                                                            <div className="flex-1">Tanda Terima (PHP)</div>
                                                                            {pdfLoading ? <Loader2 size={14} className="animate-spin text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
                                                                        </div>
                                                                    )}
                                                                </PDFDownloadLink>
                                                            )}

                                                            {/* OPSI 4: LINK GOOGLE DRIVE (Direct Access) */}
                                                            {doc.fileTahapA_TandaTerima && (
                                                                <a 
                                                                    href={doc.fileTahapA_TandaTerima} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="px-5 py-3 text-[11px] font-black text-blue-600 hover:bg-blue-50 flex items-center gap-3 cursor-pointer transition-colors uppercase tracking-tight border-t border-slate-50 mt-1"
                                                                >
                                                                    <ExternalLink size={16} /> 
                                                                    <div className="flex-1">Buka Arsip Drive</div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* OVERLAY UNTUK TUTUP DROPDOWN */}
            {openDropdown && <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setOpenDropdown(null)} />}
        </div>
    );
}