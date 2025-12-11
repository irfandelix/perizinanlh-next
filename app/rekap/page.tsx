'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic'; // Import dynamic

// --- DEFINISI TIPE DATA ---
interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaKegiatan: string;
    jenisDokumen: string;
    namaPemrakarsa: string;
    tanggalMasukDokumen: string;
    // ... (Properti Dokumen lainnya)
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
    // Fungsi ini tidak perlu memiliki logic state atau fetch data
    // Kita hanya perlu JSX tabel yang rapat
    return (
        <div className="rekap-table-wrapper">
            <table className="rekap-table">
                <thead>{/* HAPUS NEWLINE INI */}
                    <tr>{/* HAPUS NEWLINE INI */}
                        <th className="freeze col-no">No</th><th className="freeze col-checklist">No. Checklist</th><th className="freeze col-kegiatan wrap-text">Nama Kegiatan</th><th>Jenis Dok</th><th>Pemrakarsa</th><th>Tgl Masuk</th>
                        {/* Tahap B, C, D */}
                        <th>No. BA Uji Admin</th><th>Tgl. Uji Admin</th><th>No. BA Verlap</th><th>Tgl. Verlap</th><th>No. BA Pemeriksaan</th><th>Tgl. Pemeriksaan</th>
                        {/* Revisi 1-5 */}
                        <th>No. Revisi 1</th><th>Tgl. Revisi 1</th><th>No. Revisi 2</th><th>Tgl. Revisi 2</th><th>No. Revisi 3</th><th>Tgl. Revisi 3</th><th>No. Revisi 4</th><th>Tgl. Revisi 4</th><th>No. Revisi 5</th><th>Tgl. Revisi 5</th>
                        {/* PHP (Penerimaan Hasil Perbaikan) */}
                        <th>No. PHP</th><th>Tgl. PHP</th><th>Petugas Penerima</th>
                        {/* Akhir */}
                        <th style={{color:'#c0392b'}}>Tgl. Kembali</th><th style={{color:'#2980b9'}}>No. Izin Terbit</th><th>No. Risalah</th><th>Tgl. Risalah</th>
                    </tr>
                </thead>{/* HAPUS NEWLINE INI */}
                <tbody>{/* HAPUS NEWLINE INI */}
                    {rekapData.map((doc) => (
                        <tr key={doc._id}>
                            <td className="freeze col-no font-bold">{doc.noUrut}</td><td className="freeze col-checklist">{doc.nomorChecklist}</td><td className="freeze col-kegiatan wrap-text">{doc.namaKegiatan}</td><td><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{doc.jenisDokumen}</span></td><td>{doc.namaPemrakarsa}</td><td>{doc.tanggalMasukDokumen}</td>
                            
                            <td>{doc.nomorUjiBerkas || '-'}</td><td>{doc.tanggalUjiBerkas}</td><td>{doc.nomorBAVerlap || '-'}</td><td>{doc.tanggalVerlap}</td><td>{doc.nomorBAPemeriksaan || '-'}</td><td>{doc.tanggalPemeriksaan}</td>

                            <td>{doc.nomorRevisi1 || '-'}</td><td>{doc.tanggalRevisi1}</td><td>{doc.nomorRevisi2 || '-'}</td><td>{doc.tanggalRevisi2}</td><td>{doc.nomorRevisi3 || '-'}</td><td>{doc.tanggalRevisi3}</td><td>{doc.nomorRevisi4 || '-'}</td><td>{doc.tanggalRevisi4}</td><td>{doc.nomorRevisi5 || '-'}</td><td>{doc.tanggalRevisi5}</td>

                            <td>{doc.nomorPHP || '-'}</td><td>{doc.tanggalPHP}</td><td>{doc.petugasPenerimaPerbaikan}</td>

                            <td style={{fontWeight: 'bold', color: doc.tanggalPengembalian ? '#c0392b' : '#ccc'}}>{doc.tanggalPengembalian || '-'}</td>
                            <td style={{fontWeight: 'bold', color: '#2980b9'}}>{doc.nomorIzinTerbit || '-'}</td>
                            <td>{doc.nomorRisalah || '-'}</td><td>{doc.tanggalRisalah}</td>
                        </tr>
                    ))}
                </tbody>{/* HAPUS NEWLINE INI */}
            </table>
        </div>
    );
}

// =================================================================
// IMPLEMENTASI DYNAMIC (NO SSR)
// =================================================================

// Menggunakan dynamic untuk menonaktifkan SSR pada TableContent
const DynamicTableContent = dynamic(() => Promise.resolve(TableContent), {
    ssr: false,
    loading: () => (
        <div className="rekap-table-wrapper p-8 text-center text-gray-500">
            Memuat tampilan tabel...
        </div>
    )
});


// =================================================================
// KOMPONEN UTAMA (DEFAULT EXPORT)
// =================================================================

export default function RekapTabelPage() {
    // ... (State dan Logic fetch data tetap di sini) ...
    const [rekapData, setRekapData] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRekapData = async () => {
            try {
                setLoading(true);
                // PANGGIL API INTERNAL NEXT.JS
                const response = await api.get('/api/rekap'); 
                setRekapData(response.data.data);
            } catch (err) {
                setError('Gagal memuat data rekapitulasi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRekapData();
    }, []);

    // ... (handleDownloadExcel tetap di sini) ...
    const handleDownloadExcel = () => {
        if (rekapData.length === 0) {
            alert("Tidak ada data untuk diunduh.");
            return;
        }

        const dataToExport = rekapData.map(doc => ({
            // ... (Mapping data untuk Excel tetap sama) ...
            "No. Urut": doc.noUrut, "No. Checklist": doc.nomorChecklist, "Nama Kegiatan": doc.namaKegiatan, "Jenis Dokumen": doc.jenisDokumen, "Nama Pemrakarsa": doc.namaPemrakarsa, "Tanggal Masuk": doc.tanggalMasukDokumen, "No. BA Uji Administrasi": doc.nomorUjiBerkas, "Tgl. BA Uji Administrasi": doc.tanggalUjiBerkas, "No. BA Verifikasi Lapangan": doc.nomorBAVerlap, "Tgl. Verifikasi Lapangan": doc.tanggalVerlap, "No. BA Pemeriksaan Berkas": doc.nomorBAPemeriksaan, "Tgl. Pemeriksaan Berkas": doc.tanggalPemeriksaan, "No. BA Revisi 1": doc.nomorRevisi1, "Tgl. Revisi 1": doc.tanggalRevisi1, "No. BA Revisi 2": doc.nomorRevisi2, "Tgl. Revisi 2": doc.tanggalRevisi2, "No. BA Revisi 3": doc.nomorRevisi3, "Tgl. Revisi 3": doc.tanggalRevisi3, "No. BA Revisi 4": doc.nomorRevisi4, "Tgl. Revisi 4": doc.tanggalRevisi4, "No. BA Revisi 5": doc.nomorRevisi5, "Tgl. Revisi 5": doc.tanggalRevisi5, "No. Penerimaan Perbaikan": doc.nomorPHP, "Tgl. Penerimaan Perbaikan": doc.tanggalPHP, "Petugas Penerima": doc.petugasPenerimaPerbaikan, "Tgl. Pengembalian": doc.tanggalPengembalian, "No. Izin Terbit": doc.nomorIzinTerbit, "No. Risalah": doc.nomorRisalah, "Tgl. Risalah": doc.tanggalRisalah
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const wscols = Object.keys(dataToExport[0]).map(() => ({ wch: 25 }));
        wscols[0] = { wch: 8 }; wscols[2] = { wch: 50 }; worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapitulasi");
        XLSX.writeFile(workbook, "Rekapitulasi_Dokumen_DLH.xlsx");
    };

    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;


    return (
        <div className="p-6 bg-gray-50 min-h-screen">            
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Rekapitulasi Dokumen</h1>
                    <p className="text-gray-600 text-sm">Monitoring seluruh dokumen perizinan lingkungan hidup.</p>
                </div>
                <button onClick={handleDownloadExcel} className='excel-button shadow-md' disabled={loading || rekapData.length === 0}>
                    📥 {loading ? 'Memuat...' : 'Unduh Excel (.xlsx)'}
                </button>
            </div>

            {/* Panggil komponen tabel DYNAMIC (No SSR) */}
            {loading ? (
                <div className="rekap-table-wrapper p-8 text-center text-gray-500">Memuat data tabel...</div>
            ) : (
                <DynamicTableContent rekapData={rekapData} />
            )}
        </div>
    );
}