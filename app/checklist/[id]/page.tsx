"use client";

import React from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

// --- MOCK DATA ---
const detailData = {
    id: "REG-2025-0812", 
    namaKegiatan: "Pembangunan Perumahan Griya Santosa Asri",
    jenisDokumen: "UKL-UPL",
    tanggalMasuk: "10 Desember 2025",
    checklistStatus: {
        0: true, 1: true, 2: true, 4: true, 9: true,
        12: true, 13: true, 14: true
    },
    catatan: {
        0: "Lengkap",
        3: "Peta perlu diperjelas koordinatnya",
        5: "Masih proses pengurusan"
    },
    // Data Kontak
    kontak: {
        pemohon: "Sutrisno",
        telpPemohon: "081130000000",
        kuasa: "mDewi ( CV Sukma )",
        telpKuasa: "(+62)857256001"
    },
    validasi: {
        status: "Diterima",
        penyerah: "mDewi ( CV Sukma )",
        petugas: "Ima"
    }
};

export default function HalamanDetailChecklist({ params }: { params: { id: string } }) {
    
    // 18 ITEM DATA
    const checklistItems = [
        { id: 1, label: "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL*" },
        { id: 2, label: "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)*" },
        { id: 3, label: "Dokumen Lingkungan*" },
        { id: 4, label: "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan di Kertas A3" },
        { id: 5, label: "PKKPR" },
        { id: 6, label: "NIB (Untuk Swasta atau Perorangan)" },
        { id: 7, label: "Fotocopy Status Lahan (Sertifikat)" },
        { id: 8, label: "Fotocopy KTP Penanggungjawab Kegiatan" },
        { id: 9, label: "Foto Eksisting Lokasi Rencana Kegiatan Disertai dengan Titik Koordinat" },
        { id: 10, label: "Lembar Penapisan dari AMDALNET / Arahan dari Instansi Lingkungan Hidup" },
        { id: 11, label: "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)" },
        { id: 12, label: "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)" },
        { id: 13, label: "Pemenuhan Persetujuan Teknis Air Limbah" },
        { id: 14, label: "Pemenuhan Rincian Teknis Limbah B3 Sementara" },
        { id: 15, label: "Pemenuhan Persetujuan Teknis Emisi" },
        { id: 16, label: "Pemenuhan Persetujuan Teknis Andalalin" },
        { id: 17, label: "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis" },
        { id: 18, label: "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING" }
    ];

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            
            {/* --- TOMBOL NAVIGASI --- */}
            <div className="max-w-[210mm] mx-auto pt-6 mb-4 flex justify-between items-center print:hidden px-4 md:px-0">
                <button className="flex items-center text-slate-600 hover:text-slate-900 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
                </button>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm"
                >
                    <Printer className="w-4 h-4" /> Cetak (Cap Besar)
                </button>
            </div>

            {/* --- WRAPPER CETAK A4 --- */}
            <div id="print-page" className="bg-white mx-auto shadow-xl print:shadow-none bg-white">
                
                {/* LAYOUT: Padding 8mm agar muat tabel panjang + footer besar */}
                <div className="flex flex-col h-full p-[8mm] print:p-[8mm]">

                    {/* --- BAGIAN ATAS --- */}
                    <div>
                        {/* 1. HEADER */}
                        <div className="border-b-[3px] border-black pb-2 mb-3">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold print:text-black">SI DLH Sragen</p>
                            <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight print:text-black">
                                LEMBAR VERIFIKASI DOKUMEN
                            </h1>
                        </div>

                        {/* 2. DATA UTAMA */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-3">
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5 print:text-black">Nama Kegiatan</p>
                                <p className="text-[12px] font-bold text-black leading-snug">{detailData.namaKegiatan}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5 print:text-black">Jenis Permohonan</p>
                                <span className="inline-block bg-blue-100 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200 print:bg-blue-50 print:text-blue-900 print:border-blue-900 print:border">
                                    {detailData.jenisDokumen}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5 print:text-black">Nomor Checklist</p>
                                <p className="text-[12px] font-mono text-black font-medium">{detailData.id}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5 print:text-black">Tanggal Masuk Berkas</p>
                                <div className="text-[12px] font-bold text-black flex items-center">
                                    <span className="mr-1">📅</span> {detailData.tanggalMasuk}
                                </div>
                            </div>
                        </div>

                        {/* 3. TABEL CHECKLIST */}
                        <div className="mb-0">
                            <h3 className="text-black font-bold text-[13px] mb-1 flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                                Daftar Periksa Kelengkapan
                            </h3>

                            <div className="border-2 border-black w-full border-b-0">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-gray-200 border-b-2 border-black print:bg-gray-200">
                                        <tr>
                                            <th className="px-1 py-1.5 w-[6%] text-center text-[13px] font-extrabold text-black border-r-2 border-black">NO</th>
                                            <th className="px-2 py-1.5 w-[54%] text-[13px] font-extrabold text-black border-r-2 border-black">PERSYARATAN DOKUMEN</th>
                                            <th className="px-1 py-1.5 w-[12%] text-center text-[13px] font-extrabold text-black border-r-2 border-black">STATUS</th>
                                            <th className="px-2 py-1.5 w-[28%] text-[13px] font-extrabold text-black">CATATAN PETUGAS</th>
                                        </tr>
                                    </thead>
                                    {/* FONT 13px */}
                                    <tbody className="text-[13px]"> 
                                        {checklistItems.map((item, index) => {
                                            const cleanLabel = item.label.replace('*', '');
                                            const isRequired = item.label.includes('*');
                                            // @ts-ignore
                                            const isAda = detailData.checklistStatus[index] === true;
                                            // @ts-ignore
                                            const catatan = detailData.catatan[index] || "-";

                                            return (
                                                <tr key={item.id} className="border-b border-black">
                                                    {/* Padding SUPER TIPIS py-[1px] agar muat footer besar */}
                                                    <td className="px-1 py-[1px] text-center font-bold text-black border-r-2 border-black align-middle">
                                                        {item.id}
                                                    </td>
                                                    <td className="px-2 py-[1px] text-black font-medium border-r-2 border-black align-middle leading-snug">
                                                        {cleanLabel}
                                                        {isRequired && <span className="text-red-600 font-bold ml-0.5 print:text-red-600">*</span>}
                                                    </td>
                                                    <td className="px-1 py-[1px] text-center border-r-2 border-black align-middle">
                                                        {isAda ? (
                                                            <span className="inline-block bg-green-100 text-green-800 border border-green-600 px-1 py-0 rounded-[3px] text-[10px] font-bold min-w-[35px] print:bg-green-100 print:border-green-800">ADA</span>
                                                        ) : (
                                                            <span className="inline-block bg-red-50 text-red-600 border border-red-300 px-1 py-0 rounded-[3px] text-[10px] font-bold min-w-[35px] print:bg-red-50 print:border-red-600">BELUM</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-[1px] text-black italic align-middle leading-tight truncate">
                                                        {catatan}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* --- BAGIAN BAWAH (FOOTER) --- */}
                    <div className="mt-auto">
                        
                        {/* 4. FOOTER INFORMASI */}
                        <div className="w-full border-2 border-black text-[12px] text-black shadow-none -mt-[2px] z-10 relative">
                            
                            {/* Header Box */}
                            <div className="bg-gray-300 border-b-2 border-black p-1.5 font-bold print:bg-gray-300">
                                Contact Person (Nomor Telepon)
                            </div>

                            {/* Baris Kontak */}
                            <div className="border-b-2 border-black">
                                <div className="flex border-b-2 border-black last:border-0">
                                    <div className="w-[45%] p-1.5 border-r-2 border-black font-medium">Pemohon / Pemrakarsa / Pemberi Kuasa</div>
                                    <div className="w-[55%] p-1.5 flex">
                                        <span className="mr-2">:</span> 
                                        <span className="font-bold flex-1">{detailData.kontak.pemohon}</span>
                                        <span>({detailData.kontak.telpPemohon})</span>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="w-[45%] p-1.5 border-r-2 border-black font-medium">Penerima Kuasa</div>
                                    <div className="w-[55%] p-1.5 flex">
                                        <span className="mr-2">:</span> 
                                        <span className="font-bold flex-1">{detailData.kontak.kuasa}</span>
                                        <span>{detailData.kontak.telpKuasa}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Bawah: Cap Dinas & Tanda Tangan */}
                            {/* TINGGI DISET 170px AGAR BESAR */}
                            <div className="flex h-[170px]"> 
                                
                                {/* Kiri: Kolom Cap Dinas */}
                                <div className="w-[45%] border-r-2 border-black p-2 flex flex-col">
                                    <span className="font-bold mb-2">Kolom Cap Dinas</span>
                                    {/* Area Kosong */}
                                </div>

                                {/* Kanan: Status & Tanda Tangan */}
                                <div className="w-[55%] flex flex-col">
                                    
                                    {/* Status Kelengkapan */}
                                    <div className="border-b-2 border-black p-1.5 text-center flex flex-col items-center justify-center bg-gray-50 print:bg-white h-[45px]">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Status Kelengkapan Berkas*:</span>
                                            <div className="border-2 border-black px-3 py-0 font-bold text-[12px] bg-white">
                                                {detailData.validasi.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tanda Tangan */}
                                    <div className="flex flex-1">
                                        <div className="w-1/2 border-r-2 border-black p-2 text-center flex flex-col justify-between">
                                            <span className="leading-tight text-[10px] font-bold">Pemohon / Yang Menyerahkan Dokumen</span>
                                            <div className="mt-auto pb-4">
                                                <span className="font-bold underline block">({detailData.validasi.penyerah})</span>
                                            </div>
                                        </div>
                                        <div className="w-1/2 p-2 text-center flex flex-col justify-between">
                                            <span className="leading-tight text-[10px] font-bold">Petugas Gerai Mal Pelayanan Publik</span>
                                            <div className="mt-auto pb-4">
                                                <span className="font-bold underline block">({detailData.validasi.petugas})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INFO CETAK HALAMAN */}
                        <div className="flex justify-between text-[9px] text-black mt-1 italic">
                            <span>Dicetak otomatis: {new Date().toLocaleString('id-ID')}</span>
                            <span>Hal 1/1</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- CSS GLOBAL --- */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait; 
                        margin: 0; 
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        background: white;
                        visibility: hidden;
                    }
                    #print-page {
                        visibility: visible;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        z-index: 9999;
                        background-color: white !important;
                        display: block;
                    }
                    #print-page * {
                        visibility: visible;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}