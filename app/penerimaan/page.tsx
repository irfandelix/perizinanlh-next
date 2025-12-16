'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; 
import Modal from '@/components/Modal'; 
import { Download } from 'lucide-react'; 

// 1. IMPORT PDF DOWNLOAD LINK & KOMPONEN PDF
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TandaTerimaPDF_PHP } from '@/components/pdf/TandaTerimaPDF_PHP';

const tableStyles = `
    .record-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
    .record-table th, .record-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; vertical-align: top; }
    .record-table th { background-color: #f3f4f6; font-weight: 600; width: 30%; }
    .record-table td span { font-weight: bold; color: #2563eb; }
`;

export default function FormPenerimaan() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State untuk memastikan render hanya terjadi di Client (Wajib untuk PDFDownloadLink)
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState({ 
        tanggalPenyerahanPerbaikan: '',
        petugasPenerimaPerbaikan: '',
        nomorRevisi: '1' 
    });

    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModalInfo({ ...modalInfo, show: false });
    const showModal = (title: string, message: string) => setModalInfo({ show: true, title, message });

    // --- FETCH DATA ---
    const fetchRecord = useCallback(async (checklist: string) => {
        if (!checklist) { setRecordData(null); setError(''); return; }
        setLoading(true);
        try {
            const response = await api.post(`/api/record/find`, { keyword: checklist });
            if(response.data?.data?.length > 0) {
                 setRecordData(response.data.data[0]); 
            } else {
                 setRecordData(null);
                 setError("Data tidak ditemukan.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengambil data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => { if(nomorChecklist) fetchRecord(nomorChecklist); }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- SUBMIT DATA ---
    const handleApiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recordData) return;
        try {
            const response = await api.post(`/api/submit/f`, { 
                noUrut: recordData.noUrut,
                ...formData 
            });
            if (response.data.success) {
                fetchRecord(nomorChecklist);
                setFormData(prev => ({ ...prev, tanggalPenyerahanPerbaikan: '', petugasPenerimaPerbaikan: '' }));
                showModal("Sukses", response.data.message);
            }
        } catch (err: any) {
            showModal("Gagal", err.response?.data?.message || "Terjadi kesalahan.");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-lg my-8">
            <style jsx>{tableStyles}</style>
            
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Penerimaan Hasil Perbaikan Dokumen (Tahap F)
            </h1>

            <fieldset className="border p-4 rounded-md mb-6 bg-gray-50">
                <legend className="font-semibold px-2 text-blue-700">Cari Dokumen</legend>
                <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full outline-none"
                    value={nomorChecklist}
                    onChange={(e) => setNomorChecklist(e.target.value)}
                    placeholder="Masukkan Nomor Checklist..."
                />
                {loading && <p className="text-blue-500 mt-2 text-sm">Sedang mencari...</p>}
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </fieldset>
            
            {recordData && (
                <>
                <form onSubmit={handleApiSubmit} className="mb-8 border p-5 rounded-lg bg-blue-50 border-blue-100">
                    <fieldset>
                        <legend className="font-bold text-lg text-blue-800 mb-4">Input Data PHP</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">PHP Ke-Berapa?</label>
                                <select name="nomorRevisi" className="border p-2 rounded w-full" value={formData.nomorRevisi} onChange={handleChange}>
                                    <option value="1">PHP Ke-1 (Awal)</option>
                                    <option value="2">PHP Ke-2</option>
                                    <option value="3">PHP Ke-3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Tanggal Terima</label>
                                <input name="tanggalPenyerahanPerbaikan" type="date" className="border p-2 rounded w-full" value={formData.tanggalPenyerahanPerbaikan} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nama Petugas</label>
                                <input name="petugasPenerimaPerbaikan" type="text" className="border p-2 rounded w-full" value={formData.petugasPenerimaPerbaikan} onChange={handleChange} required />
                            </div>
                        </div>
                    </fieldset>
                    <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold" disabled={loading}>
                        Simpan Data
                    </button>
                </form>

                <div className="animate-fade-in">
                    <h4 className="font-bold text-lg mb-2">History Dokumen</h4>
                    <table className="record-table">
                        <tbody>
                            <tr><th>Pemrakarsa</th><td>{recordData.namaPemrakarsa}</td></tr>
                            <tr><th>Kegiatan</th><td>{recordData.namaKegiatan}</td></tr>
                            
                            {/* --- PHP KE-1 --- */}
                            {recordData.nomorPHP && (
                                <tr>
                                    <th>PHP Ke-1</th>
                                    <td>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                No: <span>{recordData.nomorPHP}</span><br/>
                                                <div className="text-gray-600 text-sm mt-1">
                                                    Tgl: {recordData.tanggalPHP}<br/>
                                                    Penerima: {recordData.petugasPenerimaPerbaikan}
                                                </div>
                                            </div>
                                            
                                            {/* IMPLEMENTASI SESUAI PERMINTAAN ANDA */}
                                            {isClient && (
                                                <PDFDownloadLink
                                                    document={
                                                        <TandaTerimaPDF_PHP 
                                                            data={{
                                                                ...recordData, // Bawa semua data record
                                                                // Override field spesifik untuk PHP ini agar PDF-nya benar
                                                                phpKe: 'PHP Ke-1',
                                                                nomorSurat: recordData.nomorPHP,
                                                                tanggalTerima: recordData.tanggalPHP,
                                                                petugas: recordData.petugasPenerimaPerbaikan
                                                            }} 
                                                        />
                                                    }
                                                    fileName={`TandaTerima_PHP1_${recordData.noUrut}.pdf`}
                                                    className="no-underline"
                                                >
                                                    {({ loading: pdfLoading }) => (
                                                        <button 
                                                            disabled={pdfLoading}
                                                            className={`flex items-center gap-1 border px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                                                pdfLoading 
                                                                ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                                                : 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50'
                                                            }`}
                                                        >
                                                            {pdfLoading ? (
                                                                <span>Loading...</span>
                                                            ) : (
                                                                <>
                                                                    <Download size={14} /> Download
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </PDFDownloadLink>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* --- PHP KE-2 --- */}
                            {recordData.nomorPHP1 && (
                                <tr>
                                    <th>PHP Ke-2</th>
                                    <td>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                No: <span>{recordData.nomorPHP1}</span><br/>
                                                <div className="text-gray-600 text-sm mt-1">
                                                    Tgl: {recordData.tanggalPHP1}<br/>
                                                    Penerima: {recordData.petugasPHP1}
                                                </div>
                                            </div>

                                            {/* TOMBOL PHP 2 */}
                                            {isClient && (
                                                <PDFDownloadLink
                                                    document={
                                                        <TandaTerimaPDF_PHP 
                                                            data={{
                                                                ...recordData,
                                                                phpKe: 'PHP Ke-2',
                                                                nomorSurat: recordData.nomorPHP1,
                                                                tanggalTerima: recordData.tanggalPHP1,
                                                                petugas: recordData.petugasPHP1
                                                            }} 
                                                        />
                                                    }
                                                    fileName={`TandaTerima_PHP2_${recordData.noUrut}.pdf`}
                                                    className="no-underline"
                                                >
                                                    {({ loading: pdfLoading }) => (
                                                        <button 
                                                            disabled={pdfLoading}
                                                            className={`flex items-center gap-1 border px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all ${
                                                                pdfLoading 
                                                                ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                                                : 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50'
                                                            }`}
                                                        >
                                                            {pdfLoading ? 'Loading...' : <><Download size={14} /> Download</>}
                                                        </button>
                                                    )}
                                                </PDFDownloadLink>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <div className="whitespace-pre-wrap">{modalInfo.message}</div>
            </Modal>
        </div>
    );
}