'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { TahapFDocument } from '@/components/CetakTahapFPdf';
import { Save, Loader2, Printer, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; // Import core pdf function

// Dynamic Import untuk PDF Components
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-gray-500 font-bold">Loading PDF...</span> }
);

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

export default function HalamanCetakTahapF() {
    const params = useParams();
    const id = params.id as string;

    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState({
        namaKegiatan: "Pembangunan Pabrik Tekstil",
        jenisDokumen: "UKL-UPL",
        nomorPHP: "600.4/015.02/17/PHP.1.UKLUPL/2026",
        tanggalPenyerahanPerbaikan: "2026-04-16",
        namaPemrakarsa: "PT. Maju Mundur",
        teleponPemrakarsa: "08111222333",
        namaKonsultan: "CV. Lingkungan Asri",
        teleponKonsultan: "08123456789",
        namaPengirim: "Budi Santoso",
        petugasPenerimaPerbaikan: "Siti Aminah, S.T."
    });

    // Efek untuk fetch data asli berdasarkan ID
    useEffect(() => {
        const fetchRealData = async () => {
            try {
                const res = await fetch('/api/record/list');
                const result = await res.json();
                if (result.success) {
                    const current = result.data.find((d: any) => d._id === id || d.noUrut === parseInt(id));
                    if (current) {
                        // Mapping data dari DB ke struktur yang dibutuhkan PDF
                        setData({
                            namaKegiatan: current.namaKegiatan,
                            jenisDokumen: current.jenisDokumen,
                            nomorPHP: current.nomorPHP || "BELUM TERBIT",
                            tanggalPenyerahanPerbaikan: current.tanggalPHP || new Date().toISOString().split('T')[0],
                            namaPemrakarsa: current.namaPemrakarsa,
                            teleponPemrakarsa: current.teleponPemrakarsa,
                            namaKonsultan: current.namaKonsultan || "-",
                            teleponKonsultan: current.teleponKonsultan || "-",
                            namaPengirim: current.namaPengirim || current.petugasPenerimaPerbaikan,
                            petugasPenerimaPerbaikan: current.petugasPenerimaPerbaikan || "Petugas DLH"
                        });
                    }
                }
            } catch (err) {
                console.error("Gagal memuat data:", err);
            }
        };
        if (id) fetchRealData();
    }, [id]);

    // --- FUNGSI SIMPAN OTOMATIS KE DRIVE ---
    const handleUploadToDrive = async () => {
        setIsSaving(true);
        try {
            // 1. Generate Blob PDF dari Template React-PDF
            const blob = await pdf(<TahapFDocument data={data} />).toBlob();
            
            // 2. Buat File Object
            const safeNomor = data.nomorPHP.replace(/\//g, '_');
            const file = new File([blob], `TandaTerima_PHP_${safeNomor}.pdf`, { type: 'application/pdf' });

            // 3. Siapkan FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('noUrut', id); // Kirim ID atau NoUrut untuk identifikasi record
            formData.append('namaPemrakarsa', data.namaPemrakarsa);
            formData.append('nomorRevisi', '1'); // Default revisi 1, bisa disesuaikan logic-nya

            // 4. Kirim ke API Tahap F (penerimaan)
            const response = await fetch('/api/submit/f', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                alert("Berhasil! Tanda terima telah tersimpan di Google Drive.");
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error(error);
            alert("Gagal mengunggah ke Drive: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center font-sans">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-5xl border border-slate-200">
                
                {/* HEADER CONTROL */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Tanda Terima Perbaikan (PHP)</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sistem Informasi Dokumen Lingkungan</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        
                        {/* TOMBOL SIMPAN KE DRIVE */}
                        <button 
                            onClick={handleUploadToDrive}
                            disabled={isSaving}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${
                                isSaving ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                            }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? 'Proses...' : 'Simpan ke Drive'}
                        </button>

                        {/* TOMBOL DOWNLOAD LOKAL */}
                        <PDFDownloadLink
                            document={<TahapFDocument data={data} />}
                            fileName={`TandaTerima_PHP_${data.nomorPHP.replace(/\//g, '_')}.pdf`}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-2.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {/* @ts-ignore */}
                            {({ loading }) => (
                                loading ? <Loader2 size={16} className="animate-spin" /> : <><Printer size={16} /> Download PDF</>
                            )}
                        </PDFDownloadLink>

                        <button 
                            onClick={() => window.close()} 
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Tutup Halaman"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PREVIEW BOX */}
                <div className="group relative">
                    <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                        Pratinjau Dokumen Resmi
                    </div>
                    <div className="w-full h-[700px] border-4 border-slate-50 rounded-3xl overflow-hidden bg-slate-200 shadow-inner">
                        <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                            <TahapFDocument data={data} />
                        </PDFViewer>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Dokumen ini di-generate secara otomatis oleh sistem SI-DLH</p>
                </div>
            </div>
        </div>
    );
}