'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic'; 
import { 
    ChevronDown, 
    FolderOpen, 
    ClipboardCheck, 
    History, 
    CheckCircle, 
    Download,
    Loader2,
    ExternalLink,
    FileText
} from 'lucide-react';

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string; 
    nomorRegistrasiAmdalnet?: string; 
    nomorSuratPermohonan?: string; 
    tanggalSuratPermohonan?: string; 
    perihalSuratPermohonan?: string; 
    namaKegiatan: string;
    jenisKegiatan?: string; 
    lokasiKegiatan?: string; 
    jenisDokumen: string;
    namaPemrakarsa: string;
    namaKonsultan?: string; 
    tanggalMasukDokumen: string;
    tahun?: string | number; 
    nomorUjiBerkas?: string; tanggalUjiBerkas?: string;
    nomorBAVerlap?: string; tanggalVerlap?: string;
    nomorBAPemeriksaan?: string; tanggalPemeriksaan?: string;
    nomorPHP?: string; tanggalPHP?: string; petugasPenerimaPerbaikan?: string;
    tanggalPengembalian?: string;
    nomorIzinTerbit?: string;
    nomorRisalah?: string; tanggalRisalah?: string;
    
    // Tambahkan ini agar TypeScript mengenali field revisi dinamis
    [key: string]: any; 

    // Atau definisikan eksplisit jika ingin lebih ketat:
    tanggalRevisi1?: string; nomorRevisi1?: string; fileRevisi1?: string;
    tanggalRevisi2?: string; nomorRevisi2?: string; fileRevisi2?: string;
    tanggalRevisi3?: string; nomorRevisi3?: string; fileRevisi3?: string;
    tanggalRevisi4?: string; nomorRevisi4?: string; fileRevisi4?: string;
    tanggalRevisi5?: string; nomorRevisi5?: string; fileRevisi5?: string;
    
    // Field Drive
    fileTahapA_Checklist?: string;
    fileTahapA_TandaTerima?: string;
    fileTahapB?: string;
    fileTahapC?: string;
    fileTahapD?: string;
    fileTahapG?: string;
    filePKPLH?: string;
    filePengembalian?: string;
}

// Helper untuk menampilkan label & nilai + Link Drive jika ada
const DetailItem = ({ label, value, highlight = false, driveLink }: { label: string, value: any, highlight?: boolean, driveLink?: string }) => (
    <div className="mb-3 group/item">
        <span className="text-gray-500 text-[10px] font-black uppercase tracking-wider block mb-0.5">{label}</span>
        <div className="flex items-center justify-between gap-2">
            <span className={`text-sm ${highlight ? 'font-extrabold text-emerald-700' : 'font-bold text-gray-800'}`}>
                {value || '-'}
            </span>
            {driveLink && (
                <a 
                    href={driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all shadow-sm"
                    title="Lihat Dokumen di Drive"
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
    </div>
);

function TableContent({ rekapData }: { rekapData: Dokumen[] }) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden font-sans">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-emerald-600 text-white">
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest w-16 text-center">No</th>
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest w-32 text-center">Tgl Masuk</th>
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest">Nama Kegiatan</th>
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest">Pemrakarsa</th>
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest w-36 text-center">Jenis Dok</th>
                            <th className="p-5 font-black text-[11px] uppercase tracking-widest w-24 text-center">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rekapData.map((doc) => (
                            <React.Fragment key={doc._id}>
                                <tr 
                                    onClick={() => toggleRow(doc._id)}
                                    className={`cursor-pointer transition-all duration-200 ${expandedRow === doc._id ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    <td className="p-5 text-center font-black text-gray-300">{doc.noUrut}</td>
                                    <td className="p-5 text-sm font-bold text-gray-500 text-center">{doc.tanggalMasukDokumen}</td>
                                    <td className="p-5">
                                        <p className="font-black text-gray-800 uppercase line-clamp-1 leading-tight tracking-tight">{doc.namaKegiatan}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-tighter uppercase">{doc.nomorChecklist || doc.nomorRegistrasiAmdalnet}</p>
                                    </td>
                                    <td className="p-5 text-xs font-bold text-gray-600 uppercase italic">{doc.namaPemrakarsa}</td>
                                    <td className="p-5 text-center">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black tracking-widest whitespace-nowrap inline-block border border-blue-100">
                                            {doc.jenisDokumen}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button className={`p-2 rounded-xl transition-all ${expandedRow === doc._id ? 'bg-emerald-600 text-white rotate-180 shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                                            <ChevronDown size={18} />
                                        </button>
                                    </td>
                                </tr>

                                {expandedRow === doc._id && (
                                    <tr className="bg-slate-50/50">
                                        <td colSpan={6} className="p-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                                
                                                {/* KOLOM 1: IDENTITAS */}
                                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                                    <h4 className="flex items-center gap-2 text-emerald-700 font-black text-sm border-b border-gray-50 pb-3 mb-5 uppercase tracking-tighter">
                                                        <div className="p-1.5 bg-emerald-100 rounded-lg"><FolderOpen size={16} /></div> Identitas & Arsip
                                                    </h4>
                                                    <DetailItem label="Nomor Checklist (DLH)" value={doc.nomorChecklist} highlight driveLink={doc.fileTahapA_Checklist} />
                                                    <DetailItem label="Tanda Terima" value="PDF Tersedia" driveLink={doc.fileTahapA_TandaTerima} />
                                                    <DetailItem label="Jenis & Lokasi" value={`${doc.jenisKegiatan || '-'} — ${doc.lokasiKegiatan || '-'}`} />
                                                    <DetailItem label="Konsultan" value={doc.namaKonsultan} />
                                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                                        <DetailItem label="Nomor & Tgl Surat Permohonan" value={`${doc.nomorSuratPermohonan || '-'} (${doc.tanggalSuratPermohonan || '-'})`} />
                                                    </div>
                                                </div>

                                                {/* KOLOM 2: BERITA ACARA */}
                                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                                    <h4 className="flex items-center gap-2 text-blue-700 font-black text-sm border-b border-gray-50 pb-3 mb-5 uppercase tracking-tighter">
                                                        <div className="p-1.5 bg-blue-100 rounded-lg"><ClipboardCheck size={16} /></div> Riwayat Berita Acara
                                                    </h4>
                                                    <DetailItem label="BA Uji Administrasi" value={doc.nomorUjiBerkas} driveLink={doc.fileTahapB} />
                                                    <DetailItem label="BA Verifikasi Lapangan" value={doc.nomorBAVerlap} driveLink={doc.fileTahapC} />
                                                    <DetailItem label="BA Pemeriksaan Berkas" value={doc.nomorBAPemeriksaan} driveLink={doc.fileTahapD} />
                                                </div>

                                                {/* KOLOM 3: REVISI & HASIL AKHIR */}
                                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                                    <h4 className="flex items-center gap-2 text-orange-600 font-black text-sm border-b border-gray-50 pb-3 mb-5 uppercase tracking-tighter">
                                                        <div className="p-1.5 bg-orange-100 rounded-lg"><History size={16} /></div> Riwayat Revisi & Izin
                                                    </h4>
                                                    <div className="mb-5">
                                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-3">Daftar Revisi</span>
                                                        <div className="space-y-3">
                                                            {[1, 2, 3, 4, 5].map((num) => {
                                                                const tgl = (doc as any)[`tanggalRevisi${num}`];
                                                                const no = (doc as any)[`nomorRevisi${num}`];
                                                                const link = (doc as any)[`fileRevisi${num}`];
                                                                if (!tgl) return null;
                                                                return (
                                                                    <div key={num} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{num}</span>
                                                                            <div>
                                                                                <p className="text-xs font-bold text-gray-800">{tgl}</p>
                                                                                <p className="text-[9px] font-mono text-slate-400 uppercase">{no || 'Proses'}</p>
                                                                            </div>
                                                                        </div>
                                                                        {link && (
                                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="p-1 bg-slate-100 text-slate-400 hover:bg-orange-600 hover:text-white rounded transition-all">
                                                                                <ExternalLink size={10} />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {!doc.tanggalRevisi1 && <p className="text-xs text-gray-300 italic">Belum ada riwayat revisi</p>}
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-dashed border-gray-100 space-y-3">
                                                        <DetailItem label="Risalah (RPD)" value={doc.nomorRisalah} driveLink={doc.fileTahapG} />
                                                        <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-100">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="text-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mb-1">Surat Izin Terbit</span>
                                                                    <span className="text-xs font-black text-white break-all leading-tight">{doc.nomorIzinTerbit || 'PROSES PENERBITAN'}</span>
                                                                </div>
                                                                {doc.filePKPLH && (
                                                                    <a href={doc.filePKPLH} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 text-white hover:bg-white/40 rounded-xl transition-all">
                                                                        <FileText size={18} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {doc.tanggalPengembalian && (
                                                            <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase">Dikembalikan</p>
                                                                    <p className="text-xs font-bold">{doc.tanggalPengembalian}</p>
                                                                </div>
                                                                {doc.filePengembalian && <a href={doc.filePengembalian} target="_blank" rel="noopener noreferrer" className="text-red-500"><ExternalLink size={14}/></a>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const DynamicTable = dynamic(() => Promise.resolve(TableContent), { ssr: false });

export default function RekapTabelPage() {
    const [rekapData, setRekapData] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchRekapData = async () => {
            try {
                const response = await api.get('/api/rekap'); 
                const docs = response.data.data;
                setRekapData(docs);
                const years = Array.from(new Set(docs.map((d: any) => d.tahun?.toString() || d.tanggalMasukDokumen?.substring(0, 4)))).sort().reverse() as string[];
                setAvailableYears(years);
                if (years.length > 0) setSelectedYear(years[0]);
            } catch (err) { 
                console.error(err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchRekapData();
    }, []);

    const filteredData = rekapData.filter((doc) => (doc.tahun?.toString() || doc.tanggalMasukDokumen?.substring(0, 4)) === selectedYear);

    const handleDownloadExcel = () => {
        const dataToExport = filteredData.map(doc => ({
            "No": doc.noUrut, 
            "Nama Kegiatan": doc.namaKegiatan, 
            "Pemrakarsa": doc.namaPemrakarsa, 
            "Jenis Dokumen": doc.jenisDokumen,
            "No. Checklist": doc.nomorChecklist, 
            "Tgl Masuk": doc.tanggalMasukDokumen, 
            "BA Uji Administrasi": doc.nomorUjiBerkas,
            "BA Verifikasi Lapangan": doc.nomorBAVerlap, 
            "BA Pemeriksaan": doc.nomorBAPemeriksaan, 
            "Risalah (RPD)": doc.nomorRisalah, 
            "No. Izin Terbit": doc.nomorIzinTerbit
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Rekap ${selectedYear}`);
        XLSX.writeFile(wb, `Rekap_DLH_${selectedYear}.xlsx`);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-2xl shadow-lg"><ClipboardCheck className="text-white" size={28}/></div>
                        Rekapitulasi Dokumen
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-3 ml-1">Monitoring Arsip & Perizinan Lingkungan Hidup</p>
                </div>
                <button 
                    onClick={handleDownloadExcel} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-3 transition-all active:scale-95"
                >
                    <Download size={18} /> Ekspor Laporan Excel {selectedYear}
                </button>
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {availableYears.map((year) => (
                    <button 
                        key={year} 
                        onClick={() => setSelectedYear(year)} 
                        className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest border-2 transition-all shrink-0 ${
                            selectedYear === year 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600'
                        }`}
                    >
                        Tahun {year}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Basis Data...</p>
                </div>
            ) : (
                <DynamicTable rekapData={filteredData} />
            )}
        </div>
    );
}