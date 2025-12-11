'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TahapFDocument } from '@/components/CetakTahapFPdf';

// Dynamic Import agar tidak error SSR
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-gray-500">Loading PDF...</span> }
);

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

export default function HalamanCetakTahapF() {
    // --- CONTOH DATA (Nanti diganti fetch API berdasarkan ID URL) ---
    const [data, setData] = useState({
        namaKegiatan: "Pembangunan Pabrik Tekstil",
        jenisDokumen: "UKL-UPL",
        nomorPHP: "600.4/015.02/17/PHP.1.UKLUPL/2025",
        tanggalPenyerahanPerbaikan: "2025-02-15",
        namaPemrakarsa: "PT. Maju Mundur",
        teleponPemrakarsa: "08111222333",
        namaKonsultan: "CV. Lingkungan Asri",
        teleponKonsultan: "08123456789",
        namaPengirim: "Budi Santoso",
        petugasPenerimaPerbaikan: "Siti Aminah, S.T."
    });
    // -------------------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-xl font-bold text-gray-800">Cetak Tanda Terima Perbaikan (PHP)</h1>
                    <button onClick={() => window.close()} className="text-gray-500 hover:text-gray-700">Tutup Tab</button>
                </div>

                <div className="flex gap-4 mb-6">
                     <PDFDownloadLink
                        document={<TahapFDocument data={data} />}
                        fileName={`TandaTerima_PHP_${data.nomorPHP.replace(/\//g, '-')}.pdf`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2"
                    >
                        {/* @ts-ignore */}
                        {({ loading }) => (loading ? 'Menyiapkan...' : '🖨️ Download PDF Resmi')}
                    </PDFDownloadLink>
                </div>

                {/* PREVIEW BOX */}
                <div className="w-full h-[600px] border border-gray-300 rounded bg-gray-50">
                    <PDFViewer width="100%" height="100%" showToolbar={false}>
                        <TahapFDocument data={data} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}