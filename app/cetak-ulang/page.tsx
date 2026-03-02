'use client';

import React, { useState, useEffect } from 'react';
import { 
    Printer, Search, ChevronDown, FileText, 
    ClipboardCheck, FileCheck, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

// --- IMPORT PDF COMPONENTS (Sesuai kodinganmu) ---
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
    checklistData?: any;
    // Data Tahapan
    nomorUjiBerkas?: string;
    nomorBAVerlap?: string;
    nomorBAPemeriksaan?: string;
    nomorPHP?: string;
    nomorPHP1?: string;
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
            } catch (error) { console.error("Error:", error); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // --- HELPER FILENAME (Sesuai kodinganmu) ---
    const getFileName = (prefix: string, recordData: any) => {
        if (!recordData || !recordData.nomorChecklist) return `${prefix}_draft.pdf`;
        try {
            const parts = recordData.nomorChecklist.split('/');
            const noUrut = parts[1] ? parts[1].split('.')[0] : '000';
            const jenisDok = parts[3] || 'DOK';
            const tahun = parts[4] || new Date().getFullYear();
            return `${prefix}_${noUrut}_${jenisDok}_${tahun}.pdf`;
        } catch (error) { return `${prefix}_${recordData.noUrut}.pdf`; }
    };

    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
        const matchesYear = docYear === selectedYear;
        const matchesSearch = doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.nomorChecklist?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesYear && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            {/* HEADER */}
            <div className="mb-8 max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-cyan-600 rounded-lg shadow-md">
                        <Printer className="text-white w-6 h-6" />
                    </div>
                    Pusat Cetak Ulang Dokumen
                </h1>
                <p className="text-gray-500 mt-2 ml-14 font-medium uppercase text-[10px] tracking-[0.2em]">
                    Cetak kembali dokumen registrasi dan tanda terima yang sudah terdaftar.
                </p>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* TABS & SEARCH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {availableYears.map((year) => (
                            <button key={year} onClick={() => setSelectedYear(year)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${
                                    selectedYear === year ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-cyan-300'
                                }`}
                            > {year} </button>
                        ))}
                    </div>
                    <div className="relative min-w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Cari Nama Kegiatan atau No. Checklist..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-16 text-cyan-600">
                            <Loader2 className="animate-spin w-10 h-10 mb-2" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Menyiapkan Data...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-cyan-50 text-cyan-900 font-black border-b border-cyan-100 uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="p-5 w-16 text-center">No</th>
                                        <th className="p-5">Kegiatan</th>
                                        <th className="p-5">Pemrakarsa</th>
                                        <th className="p-5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredData.map((doc) => {
                                        const isPHPActive = doc.nomorPHP || doc.nomorPHP1;
                                        return (
                                            <tr key={doc._id} className="hover:bg-cyan-50/20 transition-colors group">
                                                <td className="p-5 text-center font-bold text-gray-400">{doc.noUrut}</td>
                                                <td className="p-5">
                                                    <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-cyan-100 text-cyan-700 mb-1.5 uppercase">{doc.jenisDokumen}</div>
                                                    <div className="font-bold text-gray-800 line-clamp-1 uppercase group-hover:text-cyan-900 transition-colors">{doc.namaKegiatan}</div>
                                                    <div className="font-mono text-[10px] text-gray-400 mt-1">{doc.nomorChecklist}</div>
                                                </td>
                                                <td className="p-5 text-gray-600 font-medium italic">{doc.namaPemrakarsa}</td>
                                                <td className="p-5 text-center relative">
                                                    <button onClick={() => setOpenDropdown(openDropdown === doc._id ? null : doc._id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-700 hover:border-cyan-400 transition-all active:scale-95 shadow-sm"
                                                    > <Printer size={14} className="text-cyan-600" /> Cetak <ChevronDown size={14} /> </button>

                                                    {/* DROPDOWN MENU */}
                                                    {openDropdown === doc._id && isClient && (
                                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <p className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Pilih Dokumen</p>
                                                            
                                                            {/* OPSI 1: CHECKLIST */}
                                                            <PDFDownloadLink
                                                                document={<ChecklistPrintTemplate data={doc} checklistStatus={doc.checklistData?.status || {}} statusVerifikasi={doc.statusVerifikasi || "Diterima"} />}
                                                                fileName={getFileName('checklist', doc)}
                                                                className="w-full"
                                                            >
                                                                {({ loading: pdfLoading }) => (
                                                                    <div className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer">
                                                                        <FileText size={14} className="text-gray-400" /> 
                                                                        <div className="flex-1">Checklist Kelengkapan</div>
                                                                        {pdfLoading ? <Loader2 size={12} className="animate-spin text-cyan-500" /> : <ArrowRightCircle size={12} className="text-cyan-500" />}
                                                                    </div>
                                                                )}
                                                            </PDFDownloadLink>

                                                            {/* OPSI 2: TANDA TERIMA A */}
                                                            <PDFDownloadLink
                                                                document={<TandaTerimaPDF data={doc} />}
                                                                fileName={getFileName('tanda_terima', doc)}
                                                                className="w-full"
                                                            >
                                                                {({ loading: pdfLoading }) => (
                                                                    <div className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer">
                                                                        <ClipboardCheck size={14} className="text-gray-400" /> 
                                                                        <div className="flex-1">Tanda Terima (A)</div>
                                                                        {pdfLoading ? <Loader2 size={12} className="animate-spin text-green-500" /> : <ArrowRightCircle size={12} className="text-green-500" />}
                                                                    </div>
                                                                )}
                                                            </PDFDownloadLink>

                                                            {/* OPSI 3: PHP (Jika Ada) */}
                                                            {isPHPActive && (
                                                                <PDFDownloadLink
                                                                    document={<TandaTerimaPDF_PHP data={doc} />}
                                                                    fileName={getFileName('tanda_terima_php', doc)}
                                                                    className="w-full"
                                                                >
                                                                    {({ loading: pdfLoading }) => (
                                                                        <div className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-cyan-50 flex items-center gap-3 cursor-pointer">
                                                                            <FileCheck size={14} className="text-gray-400" /> 
                                                                            <div className="flex-1">Tanda Terima (F/PHP)</div>
                                                                            {pdfLoading ? <Loader2 size={12} className="animate-spin text-orange-500" /> : <ArrowRightCircle size={12} className="text-orange-500" />}
                                                                        </div>
                                                                    )}
                                                                </PDFDownloadLink>
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
            {/* Overlay untuk nutup dropdown */}
            {openDropdown && <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />}
        </div>
    );
}

// Icon Tambahan yang belum ter-import di kodinganmu
function ArrowRightCircle({ size, className }: { size: number, className?: string }) {
    return <CheckCircle size={size} className={className} />;
}