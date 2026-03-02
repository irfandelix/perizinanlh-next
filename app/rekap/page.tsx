'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic'; 
import { ChevronDown, ChevronUp, FolderOpen, ClipboardCheck, History, CheckCircle, AlertCircle } from 'lucide-react';

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
    nomorRevisi1?: string; tanggalRevisi1?: string;
    nomorRevisi2?: string; tanggalRevisi2?: string;
    nomorRevisi3?: string; tanggalRevisi3?: string;
    nomorRevisi4?: string; tanggalRevisi4?: string;
    nomorRevisi5?: string; tanggalRevisi5?: string;
    nomorPHP?: string; tanggalPHP?: string; petugasPenerimaPerbaikan?: string;
    tanggalPengembalian?: string;
    nomorIzinTerbit?: string;
    nomorRisalah?: string; tanggalRisalah?: string;
}

// Helper component untuk menampilkan label & nilai di mode dropdown
const DetailItem = ({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) => (
    <div className="mb-3">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">{label}</span>
        <span className={`text-sm ${highlight ? 'font-bold text-emerald-700' : 'font-medium text-gray-800'}`}>
            {value || '-'}
        </span>
    </div>
);

function TableContent({ rekapData }: { rekapData: Dokumen[] }) {
    // State untuk melacak baris mana yang sedang di-expand (dibuka dropdown-nya)
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-emerald-50 text-emerald-800 border-b-2 border-emerald-100">
                        <th className="p-4 font-bold text-sm w-16 text-center">No</th>
                        <th className="p-4 font-bold text-sm w-32">Tgl Masuk</th>
                        <th className="p-4 font-bold text-sm">Nama Kegiatan</th>
                        <th className="p-4 font-bold text-sm">Pemrakarsa</th>
                        <th className="p-4 font-bold text-sm w-24 text-center">Jenis</th>
                        <th className="p-4 font-bold text-sm w-24 text-center">Detail</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rekapData.map((doc) => (
                        <React.Fragment key={doc._id}>
                            {/* MASTER ROW (Selalu Tampil) */}
                            <tr 
                                onClick={() => toggleRow(doc._id)}
                                className={`cursor-pointer transition-colors duration-200 hover:bg-emerald-50/50 ${expandedRow === doc._id ? 'bg-emerald-50/50' : 'bg-white'}`}
                            >
                                <td className="p-4 text-center font-bold text-gray-700">{doc.noUrut}</td>
                                <td className="p-4 text-sm font-medium text-gray-600">{doc.tanggalMasukDokumen}</td>
                                <td className="p-4">
                                    <p className="font-bold text-gray-800 line-clamp-2">{doc.namaKegiatan}</p>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">{doc.nomorChecklist || doc.nomorRegistrasiAmdalnet}</p>
                                </td>
                                <td className="p-4 text-sm font-medium text-gray-700">{doc.namaPemrakarsa}</td>
                                <td className="p-4 text-center">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold tracking-wide">
                                        {doc.jenisDokumen}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button className={`p-2 rounded-full transition-all ${expandedRow === doc._id ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {expandedRow === doc._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </td>
                            </tr>

                            {/* DROPDOWN EXPANDED ROW (Tampil saat diklik) */}
                            {expandedRow === doc._id && (
                                <tr className="bg-slate-50 border-b border-gray-200">
                                    <td colSpan={6} className="p-0">
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in shadow-inner">
                                            
                                            {/* KOLOM 1: IDENTITAS LENGKAP & SURAT */}
                                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="flex items-center gap-2 text-emerald-700 font-bold border-b pb-2 mb-4">
                                                    <FolderOpen size={18} /> Identitas & Dokumen
                                                </h4>
                                                <DetailItem label="Nomor Checklist (DLH)" value={doc.nomorChecklist} highlight />
                                                <DetailItem label="Nomor Reg Amdalnet" value={doc.nomorRegistrasiAmdalnet} />
                                                <DetailItem label="Jenis & Lokasi Kegiatan" value={`${doc.jenisKegiatan || '-'} — ${doc.lokasiKegiatan || '-'}`} />
                                                <DetailItem label="Konsultan Penyusun" value={doc.namaKonsultan} />
                                                
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                                    <DetailItem label="Surat Permohonan (No & Tgl)" value={`${doc.nomorSuratPermohonan || '-'} (${doc.tanggalSuratPermohonan || '-'})`} />
                                                    <DetailItem label="Perihal Surat" value={doc.perihalSuratPermohonan} />
                                                </div>
                                            </div>

                                            {/* KOLOM 2: PROSES BERITA ACARA (BA) */}
                                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2 mb-4">
                                                    <ClipboardCheck size={18} /> Riwayat Berita Acara
                                                </h4>
                                                <DetailItem label="BA Uji Administrasi" value={`${doc.nomorUjiBerkas || '-'} ${doc.tanggalUjiBerkas ? `(${doc.tanggalUjiBerkas})` : ''}`} />
                                                <DetailItem label="BA Verifikasi Lapangan" value={`${doc.nomorBAVerlap || '-'} ${doc.tanggalVerlap ? `(${doc.tanggalVerlap})` : ''}`} />
                                                <DetailItem label="BA Pemeriksaan Berkas" value={`${doc.nomorBAPemeriksaan || '-'} ${doc.tanggalPemeriksaan ? `(${doc.tanggalPemeriksaan})` : ''}`} />
                                            </div>

                                            {/* KOLOM 3: REVISI, PHP & HASIL AKHIR */}
                                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="flex items-center gap-2 text-orange-600 font-bold border-b pb-2 mb-4">
                                                    <History size={18} /> Riwayat Revisi & Akhir
                                                </h4>
                                                
                                                {/* Logic untuk menampilkan revisi terakhir yang terisi saja, atau '-' jika kosong */}
                                                <div className="mb-3">
                                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">Riwayat Revisi</span>
                                                    <div className="text-sm font-medium text-gray-800 space-y-1">
                                                        {doc.nomorRevisi1 ? <div className="flex gap-2 text-xs items-center"><span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">1</span> {doc.tanggalRevisi1}</div> : '-'}
                                                        {doc.nomorRevisi2 && <div className="flex gap-2 text-xs items-center"><span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">2</span> {doc.tanggalRevisi2}</div>}
                                                        {doc.nomorRevisi3 && <div className="flex gap-2 text-xs items-center"><span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">3</span> {doc.tanggalRevisi3}</div>}
                                                        {doc.nomorRevisi4 && <div className="flex gap-2 text-xs items-center"><span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">4</span> {doc.tanggalRevisi4}</div>}
                                                        {doc.nomorRevisi5 && <div className="flex gap-2 text-xs items-center"><span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">5</span> {doc.tanggalRevisi5}</div>}
                                                    </div>
                                                </div>

                                                <DetailItem label="Penerimaan Hasil Perbaikan (PHP)" value={`${doc.nomorPHP || '-'} ${doc.tanggalPHP ? `(${doc.tanggalPHP})` : ''}`} />
                                                
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                                                    {doc.tanggalPengembalian && (
                                                        <div className="mb-3 text-red-600 flex items-start gap-2">
                                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="text-xs font-bold uppercase block">Dikembalikan Pada</span>
                                                                <span className="text-sm font-bold">{doc.tanggalPengembalian}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <DetailItem label="Nomor Risalah" value={`${doc.nomorRisalah || '-'} ${doc.tanggalRisalah ? `(${doc.tanggalRisalah})` : ''}`} />
                                                    
                                                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mt-2">
                                                        <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                                                            <CheckCircle size={14} /> Izin Terbit
                                                        </span>
                                                        <span className="font-bold text-emerald-900">{doc.nomorIzinTerbit || 'Belum Terbit'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    
                    {rekapData.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                                Belum ada dokumen yang terdaftar.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const DynamicTableContent = dynamic(() => Promise.resolve(TableContent), { ssr: false, loading: () => (<div className="p-8 text-center text-gray-500 font-medium animate-pulse bg-white rounded-xl shadow-sm border border-gray-200">Memuat tampilan tabel dropdown...</div>) });

export default function RekapTabelPage() {
    const [rekapData, setRekapData] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchRekapData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/rekap'); 
                const docs = response.data.data;
                setRekapData(docs);

                const yearsSet = new Set(docs.map((item: Dokumen) => item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString())));
                const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
                setAvailableYears(yearsArray);
                
                if (yearsArray.length > 0) setSelectedYear(yearsArray[0]);

            } catch (err) {
                setError('Gagal memuat data rekapitulasi.');
            } finally {
                setLoading(false);
            }
        };
        fetchRekapData();
    }, []);

    const filteredData = rekapData.filter((doc) => {
        const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
        return docYear === selectedYear;
    });

    const handleDownloadExcel = () => {
        if (filteredData.length === 0) return alert(`Tidak ada data untuk tahun ${selectedYear}.`);

        const dataToExport = filteredData.map(doc => ({
            "No. Urut": doc.noUrut, 
            "No. Checklist (DLH)": doc.nomorChecklist || '-', 
            "No. Reg Amdalnet": doc.nomorRegistrasiAmdalnet || '-', 
            "Nama Kegiatan": doc.namaKegiatan, 
            "Jenis Kegiatan": doc.jenisKegiatan || '-',
            "Lokasi Kegiatan": doc.lokasiKegiatan || '-',
            "Jenis Dokumen": doc.jenisDokumen, 
            "Nama Pemrakarsa": doc.namaPemrakarsa, 
            "Nama Konsultan": doc.namaKonsultan || '-',
            "Tanggal Masuk": doc.tanggalMasukDokumen, 
            "No. Surat Permohonan": doc.nomorSuratPermohonan || '-',
            "Tgl. Surat": doc.tanggalSuratPermohonan || '-',
            "Perihal Surat": doc.perihalSuratPermohonan || '-',
            "No. BA Uji Administrasi": doc.nomorUjiBerkas, "Tgl. BA Uji Administrasi": doc.tanggalUjiBerkas, 
            "No. BA Verifikasi Lapangan": doc.nomorBAVerlap, "Tgl. Verifikasi Lapangan": doc.tanggalVerlap, 
            "No. BA Pemeriksaan Berkas": doc.nomorBAPemeriksaan, "Tgl. Pemeriksaan Berkas": doc.tanggalPemeriksaan, 
            "No. BA Revisi 1": doc.nomorRevisi1, "Tgl. Revisi 1": doc.tanggalRevisi1, 
            "No. BA Revisi 2": doc.nomorRevisi2, "Tgl. Revisi 2": doc.tanggalRevisi2, 
            "No. BA Revisi 3": doc.nomorRevisi3, "Tgl. Revisi 3": doc.tanggalRevisi3, 
            "No. BA Revisi 4": doc.nomorRevisi4, "Tgl. Revisi 4": doc.tanggalRevisi4, 
            "No. BA Revisi 5": doc.nomorRevisi5, "Tgl. Revisi 5": doc.tanggalRevisi5, 
            "No. Penerimaan Perbaikan": doc.nomorPHP, "Tgl. Penerimaan Perbaikan": doc.tanggalPHP, 
            "Petugas Penerima": doc.petugasPenerimaPerbaikan, "Tgl. Pengembalian": doc.tanggalPengembalian, 
            "No. Izin Terbit": doc.nomorIzinTerbit, "No. Risalah": doc.nomorRisalah, "Tgl. Risalah": doc.tanggalRisalah
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const wscols = Object.keys(dataToExport[0]).map(() => ({ wch: 20 }));
        wscols[0] = { wch: 8 }; wscols[3] = { wch: 40 }; wscols[5] = { wch: 50 }; worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedYear}`);
        XLSX.writeFile(workbook, `Rekapitulasi_Dokumen_DLH_${selectedYear}.xlsx`);
    };

    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="p-6 bg-slate-100 min-h-screen">            
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Rekapitulasi Dokumen</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Monitoring seluruh proses dokumen perizinan lingkungan hidup.</p>
                </div>
                <button onClick={handleDownloadExcel} className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 hover:-translate-y-0.5' disabled={loading || filteredData.length === 0}>
                    📥 {loading ? 'Memuat...' : `Unduh Excel ${selectedYear}`}
                </button>
            </div>

            {availableYears.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {availableYears.map((year) => (
                        <button key={year} onClick={() => setSelectedYear(year)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2 ${selectedYear === year ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'}`}>Tahun {year}</button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="p-12 text-center text-emerald-600 font-bold text-lg animate-pulse bg-white rounded-xl shadow-sm border border-gray-200">
                    Sedang mengambil data rekap dari server...
                </div>
            ) : (
                <DynamicTableContent rekapData={filteredData} />
            )}
        </div>
    );
}