'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; 
import Modal from '@/components/Modal'; 
import { Download, Search, Save } from 'lucide-react'; 
import { PDFDownloadLink } from '@react-pdf/renderer';

// --- IMPORT PDF (Pastikan file ini ada di components/pdf/TandaTerimaPDF_PHP.tsx) ---
import { TandaTerimaPDF_PHP } from '@/components/pdf/TandaTerimaPDF_PHP';

const tableStyles = `
    .record-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
    .record-table th, .record-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; vertical-align: top; }
    .record-table th { background-color: #f3f4f6; font-weight: 600; width: 30%; color: #374151; }
    .record-table td span { font-weight: bold; color: #2563eb; }
`;

// --- WAJIB PAKAI 'export default' AGAR NEXT.JS BISA BACA ---
export default function FormPenerimaan() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

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
                 setError('');
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

    // Debounce Search
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
                fetchRecord(nomorChecklist); // Refresh data
                setFormData(prev => ({ ...prev, tanggalPenyerahanPerbaikan: '', petugasPenerimaPerbaikan: '' }));
                showModal("Sukses", response.data.message);
            }
        } catch (err: any) {
            showModal("Gagal", err.response?.data?.message || "Terjadi kesalahan.");
        }
    };

    // --- HELPER RENDER BARIS TABEL ---
    const renderPHPRow = (labelRevisi: string, noSurat: string, tgl: string, petugas: string, pdfFileName: string) => {
        if (!noSurat) return null; 

        return (
            <tr>
                <th>{labelRevisi}</th>
                <td>
                    <div className="flex justify-between items-start">
                        <div>
                            No: <span>{noSurat}</span><br/>
                            <div className="text-gray-500 text-xs mt-1">
                                Tgl: {tgl} | Petugas: {petugas}
                            </div>
                        </div>
                        
                        {isClient && (
                            <PDFDownloadLink
                                document={
                                    <TandaTerimaPDF_PHP 
                                        data={{
                                            ...recordData,
                                            // Mengirim label spesifik ke PDF
                                            phpKe: labelRevisi, 
                                            nomorSurat: noSurat,
                                            tanggalTerima: tgl,
                                            petugas: petugas
                                        }} 
                                    />
                                }
                                fileName={pdfFileName}
                                className="no-underline"
                            >
                                {({ loading: pdfLoading }) => (
                                    <button 
                                        disabled={pdfLoading}
                                        className={`flex items-center gap-1 border px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
                                            pdfLoading ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-white border-orange-300 text-orange-700 hover:bg-orange-50'
                                        }`}
                                    >
                                        {pdfLoading ? '...' : <><Download size={14} /> Cetak</>}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-xl my-8 border border-gray-100">
            <style jsx>{tableStyles}</style>
            
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Search className="text-blue-600" />
                Penerimaan Hasil Perbaikan (Tahap F)
            </h1>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <label className="block text-sm font-bold text-blue-800 mb-2">Cari Dokumen (Nomor Checklist)</label>
                <div className="relative">
                    <input
                        type="text"
                        className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={nomorChecklist}
                        onChange={(e) => setNomorChecklist(e.target.value)}
                        placeholder="Contoh: 600.4/001.10/..."
                    />
                    {loading && <span className="absolute right-3 top-3 text-sm text-blue-500 font-medium">Mencari...</span>}
                </div>
                {error && <p className="text-red-500 mt-2 text-sm font-medium bg-red-50 p-2 rounded">{error}</p>}
            </div>
            
            {recordData && (
                <>
                {/* FORM INPUT */}
                <form onSubmit={handleApiSubmit} className="mb-8 p-6 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <Save className="w-5 h-5 text-green-600" /> Input Data Revisi Baru
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Tahapan Revisi</label>
                            <select name="nomorRevisi" className="w-full p-2.5 border rounded-lg bg-white" value={formData.nomorRevisi} onChange={handleChange}>
                                <option value="1">PHP Ke-1 (Awal)</option>
                                <option value="2">PHP Ke-2</option>
                                <option value="3">PHP Ke-3</option>
                                <option value="4">PHP Ke-4</option>
                                <option value="5">PHP Ke-5</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Tanggal Terima</label>
                            <input name="tanggalPenyerahanPerbaikan" type="date" className="w-full p-2.5 border rounded-lg" value={formData.tanggalPenyerahanPerbaikan} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Nama Petugas</label>
                            <input name="petugasPenerimaPerbaikan" type="text" className="w-full p-2.5 border rounded-lg" value={formData.petugasPenerimaPerbaikan} onChange={handleChange} required placeholder="Nama Penerima..." />
                        </div>
                    </div>
                    <button type="submit" className="mt-5 w-full md:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all" disabled={loading}>
                        Simpan Data
                    </button>
                </form>

                {/* TABEL HISTORY */}
                <div className="animate-fade-in">
                    <h4 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Riwayat Dokumen</h4>
                    <table className="record-table">
                        <tbody>
                            <tr><th>Pemrakarsa</th><td>{recordData.namaPemrakarsa}</td></tr>
                            <tr><th>Nama Kegiatan</th><td>{recordData.namaKegiatan}</td></tr>
                            
                            {/* RENDER SEMUA REVISI YANG ADA */}
                            {renderPHPRow('PHP Ke-1', recordData.nomorPHP,  recordData.tanggalPHP,  recordData.petugasPenerimaPerbaikan, `TT_PHP1_${recordData.noUrut}.pdf`)}
                            {renderPHPRow('PHP Ke-2', recordData.nomorPHP2, recordData.tanggalPHP2, recordData.petugasPHP2, `TT_PHP2_${recordData.noUrut}.pdf`)}
                            {renderPHPRow('PHP Ke-3', recordData.nomorPHP3, recordData.tanggalPHP3, recordData.petugasPHP3, `TT_PHP3_${recordData.noUrut}.pdf`)}
                            {renderPHPRow('PHP Ke-4', recordData.nomorPHP4, recordData.tanggalPHP4, recordData.petugasPHP4, `TT_PHP4_${recordData.noUrut}.pdf`)}
                            {renderPHPRow('PHP Ke-5', recordData.nomorPHP5, recordData.tanggalPHP5, recordData.petugasPHP5, `TT_PHP5_${recordData.noUrut}.pdf`)}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <div className="text-gray-700">{modalInfo.message}</div>
            </Modal>
        </div>
    );
}