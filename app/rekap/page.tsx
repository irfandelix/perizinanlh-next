'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic'; 

// --- DEFINISI TIPE DATA ---
interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    nomorRegistrasiAmdalnet?: string; // Tambahan field amdalnet
    namaKegiatan: string;
    jenisDokumen: string;
    namaPemrakarsa: string;
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

// =================================================================
// KOMPONEN CHILD: BERISI TABEL UNTUK DINONAKTIFKAN SSR-NYA
// =================================================================

function TableContent({ rekapData }: { rekapData: Dokumen[] }) {
    return (
        <div className="rekap-table-wrapper">
            <table className="rekap-table">
                <thead>
                    <tr>
                        <th className="freeze col-no">No</th>
                        <th className="freeze col-checklist">No. Checklist</th>
                        <th className="freeze col-checklist">No. Reg Amdalnet</th>
                        <th className="freeze col-kegiatan wrap-text">Nama Kegiatan</th>
                        <th>Jenis Dok</th>
                        <th>Pemrakarsa</th>
                        <th>Tgl Masuk</th>
                        {/* Tahap B, C, D */}
                        <th>No. BA Uji Admin</th><th>Tgl. Uji Admin</th><th>No. BA Verlap</th><th>Tgl. Verlap</th><th>No. BA Pemeriksaan</th><th>Tgl. Pemeriksaan</th>
                        {/* Revisi 1-5 */}
                        <th>No. Revisi 1</th><th>Tgl. Revisi 1</th><th>No. Revisi 2</th><th>Tgl. Revisi 2</th><th>No. Revisi 3</th><th>Tgl. Revisi 3</th><th>No. Revisi 4</th><th>Tgl. Revisi 4</th><th>No. Revisi 5</th><th>Tgl. Revisi 5</th>
                        {/* PHP (Penerimaan Hasil Perbaikan) */}
                        <th>No. PHP</th><th>Tgl. PHP</th><th>Petugas Penerima</th>
                        {/* Akhir */}
                        <th style={{color:'#c0392b'}}>Tgl. Kembali</th><th style={{color:'#2980b9'}}>No. Izin Terbit</th><th>No. Risalah</th><th>Tgl. Risalah</th>
                    </tr>
                </thead>
                <tbody>
                    {rekapData.map((doc) => (
                        <tr key={doc._id}>
                            <td className="freeze col-no font-bold">{doc.noUrut}</td>
                            <td className="freeze col-checklist">{doc.nomorChecklist}</td>
                            <td className="freeze col-checklist text-emerald-700 font-semibold">{doc.nomorRegistrasiAmdalnet || '-'}</td>
                            <td className="freeze col-kegiatan wrap-text">{doc.namaKegiatan}</td>
                            <td><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{doc.jenisDokumen}</span></td>
                            <td>{doc.namaPemrakarsa}</td>
                            <td>{doc.tanggalMasukDokumen}</td>
                            
                            <td>{doc.nomorUjiBerkas || '-'}</td><td>{doc.tanggalUjiBerkas}</td><td>{doc.nomorBAVerlap || '-'}</td><td>{doc.tanggalVerlap}</td><td>{doc.nomorBAPemeriksaan || '-'}</td><td>{doc.tanggalPemeriksaan}</td>

                            <td>{doc.nomorRevisi1 || '-'}</td><td>{doc.tanggalRevisi1}</td><td>{doc.nomorRevisi2 || '-'}</td><td>{doc.tanggalRevisi2}</td><td>{doc.nomorRevisi3 || '-'}</td><td>{doc.tanggalRevisi3}</td><td>{doc.nomorRevisi4 || '-'}</td><td>{doc.tanggalRevisi4}</td><td>{doc.nomorRevisi5 || '-'}</td><td>{doc.tanggalRevisi5}</td>

                            <td>{doc.nomorPHP || '-'}</td><td>{doc.tanggalPHP}</td><td>{doc.petugasPenerimaPerbaikan}</td>

                            <td style={{fontWeight: 'bold', color: doc.tanggalPengembalian ? '#c0392b' : '#ccc'}}>{doc.tanggalPengembalian || '-'}</td>
                            <td style={{fontWeight: 'bold', color: '#2980b9'}}>{doc.nomorIzinTerbit || '-'}</td>
                            <td>{doc.nomorRisalah || '-'}</td><td>{doc.tanggalRisalah}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// =================================================================
// IMPLEMENTASI DYNAMIC (NO SSR)
// =================================================================
const DynamicTableContent = dynamic(() => Promise.resolve(TableContent), {
    ssr: false,
    loading: () => (
        <div className="rekap-table-wrapper p-8 text-center text-gray-500 font-medium animate-pulse">
            Memuat tampilan tabel...
        </div>
    )
});

// =================================================================
// KOMPONEN UTAMA (DEFAULT EXPORT)
// =================================================================

export default function RekapTabelPage() {
    const [rekapData, setRekapData] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- STATE UNTUK FITUR TAB TAHUN ---
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchRekapData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/rekap'); 
                const docs = response.data.data;
                setRekapData(docs);

                // --- LOGIKA MENCARI TAHUN YANG TERSEDIA ---
                const yearsSet = new Set(docs.map((item: Dokumen) => {
                    return item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString());
                }));
                
                const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
                setAvailableYears(yearsArray);
                
                if (yearsArray.length > 0) {
                    setSelectedYear(yearsArray[0]);
                }

            } catch (err) {
                setError('Gagal memuat data rekapitulasi.');
                console.error(err);
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
        if (filteredData.length === 0) {
            alert(`Tidak ada data untuk tahun ${selectedYear} yang bisa diunduh.`);
            return;
        }

        // --- EXPORT HANYA DATA TAHUN YANG SEDANG AKTIF ---
        const dataToExport = filteredData.map(doc => ({
            "No. Urut": doc.noUrut, 
            "No. Checklist": doc.nomorChecklist, 
            "No. Reg Amdalnet": doc.nomorRegistrasiAmdalnet || '-',
            "Nama Kegiatan": doc.namaKegiatan, 
            "Jenis Dokumen": doc.jenisDokumen, 
            "Nama Pemrakarsa": doc.namaPemrakarsa, 
            "Tanggal Masuk": doc.tanggalMasukDokumen, 
            "No. BA Uji Administrasi": doc.nomorUjiBerkas, 
            "Tgl. BA Uji Administrasi": doc.tanggalUjiBerkas, 
            "No. BA Verifikasi Lapangan": doc.nomorBAVerlap, 
            "Tgl. Verifikasi Lapangan": doc.tanggalVerlap, 
            "No. BA Pemeriksaan Berkas": doc.nomorBAPemeriksaan, 
            "Tgl. Pemeriksaan Berkas": doc.tanggalPemeriksaan, 
            "No. BA Revisi 1": doc.nomorRevisi1, 
            "Tgl. Revisi 1": doc.tanggalRevisi1, 
            "No. BA Revisi 2": doc.nomorRevisi2, 
            "Tgl. Revisi 2": doc.tanggalRevisi2, 
            "No. BA Revisi 3": doc.nomorRevisi3, 
            "Tgl. Revisi 3": doc.tanggalRevisi3, 
            "No. BA Revisi 4": doc.nomorRevisi4, 
            "Tgl. Revisi 4": doc.tanggalRevisi4, 
            "No. BA Revisi 5": doc.nomorRevisi5, 
            "Tgl. Revisi 5": doc.tanggalRevisi5, 
            "No. Penerimaan Perbaikan": doc.nomorPHP, 
            "Tgl. Penerimaan Perbaikan": doc.tanggalPHP, 
            "Petugas Penerima": doc.petugasPenerimaPerbaikan, 
            "Tgl. Pengembalian": doc.tanggalPengembalian, 
            "No. Izin Terbit": doc.nomorIzinTerbit, 
            "No. Risalah": doc.nomorRisalah, 
            "Tgl. Risalah": doc.tanggalRisalah
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const wscols = Object.keys(dataToExport[0]).map(() => ({ wch: 25 }));
        wscols[0] = { wch: 8 }; wscols[3] = { wch: 50 }; worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${selectedYear}`);
        XLSX.writeFile(workbook, `Rekapitulasi_Dokumen_DLH_${selectedYear}.xlsx`);
    };

    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">            
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Rekapitulasi Dokumen</h1>
                    <p className="text-gray-600 text-sm mt-1">Monitoring seluruh dokumen perizinan lingkungan hidup per tahun.</p>
                </div>
                <button 
                    onClick={handleDownloadExcel} 
                    className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed' 
                    disabled={loading || filteredData.length === 0}
                >
                    📥 {loading ? 'Memuat...' : `Unduh Excel ${selectedYear}`}
                </button>
            </div>

            {/* --- UI TAB TAHUN --- */}
            {availableYears.length > 0 && (
                <div className="flex gap-2 border-b-2 border-emerald-100 mb-6 overflow-x-auto pt-2 pl-2">
                    {availableYears.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-8 py-3 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${
                                selectedYear === year
                                    ? 'bg-emerald-600 text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] transform -translate-y-1' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-900'
                            }`}
                        >
                            Tahun {year}
                        </button>
                    ))}
                </div>
            )}

            {/* Panggil komponen tabel DYNAMIC menggunakan Data yang Difilter */}
            {loading ? (
                <div className="rekap-table-wrapper p-12 text-center text-emerald-600 font-bold text-lg animate-pulse border-2 border-emerald-100 rounded-xl bg-white">
                    Sedang memuat data dari server...
                </div>
            ) : (
                <DynamicTableContent rekapData={filteredData} />
            )}
        </div>
    );
}