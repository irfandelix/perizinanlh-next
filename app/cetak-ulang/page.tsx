'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Import PDF Generator components (needed for client-side generation)
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ChecklistPrintTemplate } from '@/components/pdf/ChecklistPrintTemplate';
import { TandaTerimaPDF } from '@/components/pdf/TandaTerimaPDF';

// Helper to format filename
const getFileName = (prefix: string, recordData: any) => {
    if (!recordData || !recordData.nomorChecklist) return `${prefix}_draft.pdf`;
    try {
        const parts = recordData.nomorChecklist.split('/');
        const noUrut = parts[1] ? parts[1].split('.')[0] : '000';
        const jenisDok = parts[3] || 'DOK';
        const tahun = parts[4] || new Date().getFullYear();
        return `${prefix}_${noUrut}_${jenisDok}_${tahun}.pdf`;
    } catch (error) {
        return `${prefix}_${recordData.noUrut}.pdf`;
    }
};

export default function HalamanCetakUlang() {
    // --- STATE ---
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recordData, setRecordData] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    // --- FETCH DATA (DEBOUNCE) ---
    const fetchRecord = useCallback(async (checklist: string) => {
        if (!checklist) {
            setRecordData(null);
            setError('');
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            // FIXED: Changed key from 'nomorChecklist' to 'keyword'
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: checklist }) 
            });

            const response = await res.json();

            if (response.success) {
                // Handle array response if backend returns list
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                setRecordData(data);
            } else {
                setRecordData(null);
                if (checklist.length > 5) setError(response.message || 'Dokumen tidak ditemukan.');
            }
        } catch (err) {
            setRecordData(null);
            setError('Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce Effect
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchRecord(nomorChecklist);
        }, 500);

        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    // Parse checklist data from JSON string if needed
    const getChecklistData = () => {
        if (!recordData) return { status: {}, notes: {} };
        try {
            // If stored as string in DB, parse it
            if (typeof recordData.checklistData === 'string') {
                return JSON.parse(recordData.checklistData);
            }
            return recordData.checklistData || { status: {}, notes: {} };
        } catch (e) {
            return { status: {}, notes: {} };
        }
    };
    
    const checklistData = getChecklistData();

    // Check availability for Stage F (PHP)
    const isTahapFAvailable = recordData && (recordData.nomorPHP || recordData.nomorPHP1);

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                
                {/* HEADER */}
                <div className="bg-blue-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        🖨️ Pusat Cetak Ulang Dokumen
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">Cari dan download kembali dokumen yang sudah terdaftar.</p>
                </div>

                {/* CONTENT */}
                <div className="p-8">
                    <div className="mb-6">
                        <label htmlFor="nomorChecklist" className="block text-sm font-bold text-gray-700 mb-2">
                            Masukkan Nomor Registrasi / Checklist / Nama Pemrakarsa
                        </label>
                        <div className="relative">
                            <input
                                id="nomorChecklist"
                                type="text"
                                className="w-full border-2 border-gray-300 rounded-lg pl-4 pr-10 py-3 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors text-lg"
                                value={nomorChecklist}
                                onChange={(e) => setNomorChecklist(e.target.value)}
                                placeholder="Contoh: 660/012/REG... atau Nama PT"
                                autoComplete="off"
                            />
                            {loading && (
                                <div className="absolute right-3 top-3.5">
                                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                </div>
                            )}
                        </div>

                        {/* Status Message */}
                        <div className="mt-3 min-h-5">
                            {error && (
                                <p className="text-red-500 text-sm font-medium flex items-center gap-1 animate-in slide-in-from-left-2">
                                    ⚠️ {error}
                                </p>
                            )}
                            {recordData && !loading && (
                                <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm animate-in fade-in">
                                    <p className="font-bold">✓ Dokumen Ditemukan:</p>
                                    <p>{recordData.namaKegiatan}</p>
                                    <p className="text-xs text-gray-500 mt-1">Pemrakarsa: {recordData.namaPemrakarsa} | No: {recordData.nomorChecklist}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Dokumen Tersedia
                        </h3>
                        
                        <div className="grid gap-3">
                            {/* TOMBOL 1: CHECKLIST */}
                            {isClient && (
                                <PDFDownloadLink
                                    document={
                                        <ChecklistPrintTemplate 
                                            data={recordData || {}} 
                                            checklistStatus={checklistData.status || {}}
                                            statusVerifikasi={recordData?.statusVerifikasi || "Diterima"}
                                        />
                                    }
                                    fileName={getFileName('checklist', recordData)}
                                    className={`w-full no-underline ${!recordData ? 'pointer-events-none' : ''}`}
                                >
                                    {({ loading: pdfLoading }) => (
                                        <div className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                                            recordData 
                                            ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer group' 
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">📋</span>
                                                <div className="text-left">
                                                    <p className={`font-bold ${recordData ? 'text-gray-800 group-hover:text-blue-700' : ''}`}>Checklist Kelengkapan</p>
                                                    <p className="text-xs">Daftar periksa dokumen tahap awal</p>
                                                </div>
                                            </div>
                                            {recordData && <span className="text-blue-600 font-semibold text-sm">{pdfLoading ? 'Loading...' : 'Download →'}</span>}
                                        </div>
                                    )}
                                </PDFDownloadLink>
                            )}

                            {/* TOMBOL 2: TANDA TERIMA A */}
                            {isClient && (
                                <PDFDownloadLink
                                    document={<TandaTerimaPDF data={recordData || {}} />}
                                    fileName={getFileName('tanda_terima', recordData)}
                                    className={`w-full no-underline ${!recordData ? 'pointer-events-none' : ''}`}
                                >
                                    {({ loading: pdfLoading }) => (
                                        <div className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                                            recordData 
                                            ? 'border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer group' 
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🧾</span>
                                                <div className="text-left">
                                                    <p className={`font-bold ${recordData ? 'text-gray-800 group-hover:text-green-700' : ''}`}>Tanda Terima Registrasi (A)</p>
                                                    <p className="text-xs">Bukti serah terima berkas awal</p>
                                                </div>
                                            </div>
                                            {recordData && <span className="text-green-600 font-semibold text-sm">{pdfLoading ? 'Loading...' : 'Download →'}</span>}
                                        </div>
                                    )}
                                </PDFDownloadLink>
                            )}

                            {/* TOMBOL 3: TANDA TERIMA F (PHP) - Placeholder jika belum ada template khusus PHP */}
                            <button
                                disabled={true} // Sementara disable atau buat template khusus PHP
                                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    isTahapFAvailable 
                                    ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer group' 
                                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔄</span>
                                    <div className="text-left">
                                        <p className={`font-bold ${isTahapFAvailable ? 'text-orange-900' : ''}`}>Tanda Terima Perbaikan (F)</p>
                                        <p className="text-xs">
                                            {isTahapFAvailable ? 'Fitur cetak PHP sedang dalam pengembangan' : 'Belum tersedia (Dokumen belum masuk tahap revisi/perbaikan)'}
                                        </p>
                                    </div>
                                </div>
                                {isTahapFAvailable && <span className="text-orange-700 font-semibold text-sm">Segera →</span>}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}