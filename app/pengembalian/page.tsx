'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; 
import Modal from '@/components/Modal'; 
import { Search, Save, RotateCcw, FileText, AlertCircle } from 'lucide-react';

// 1. Definisi Tipe Data
interface RecordData {
    noUrut: string;
    namaPemrakarsa: string;
    namaKegiatan?: string; 
    jenisKegiatan: string;
    alamatKegiatan: string;
    statusTerakhir: string;
    tanggalPengembalian?: string;
    nomorChecklist?: string;
}

// Style tabel
const tableStyles = `
    .record-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
    .record-table th, .record-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; vertical-align: top; }
    .record-table th { background-color: #fff7ed; font-weight: 600; width: 30%; color: #9a3412; } 
    .record-table td span { font-weight: bold; color: #ea580c; }
`;

export default function FormPengembalian() {
    // State
    const [nomorChecklist, setNomorChecklist] = useState<string>('');
    const [recordData, setRecordData] = useState<RecordData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [tanggalPengembalian, setTanggalPengembalian] = useState<string>('');

    // Modal State
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModalInfo({ ...modalInfo, show: false });
    const showModal = (title: string, message: string) => setModalInfo({ show: true, title, message });

    // Fungsi Cari Data
    const fetchRecord = useCallback(async (checklist: string) => {
        if (!checklist) {
            setRecordData(null);
            setError('');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post(`/api/record/find`, { keyword: checklist });
            
            const resultData = response.data.data;
            const data = Array.isArray(resultData) ? resultData[0] : resultData;

            if (!data) throw new Error("Data tidak ditemukan");

            setRecordData(data);
            
            // Ambil tanggal yang sudah ada di DB (jika ada)
            const existingDate = data.tanggalPengembalian;
            setTanggalPengembalian(existingDate ? existingDate.split('T')[0] : '');
        } catch (err: any) {
            setRecordData(null);
            setError(err.response?.data?.message || 'Data tidak ditemukan.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Efek ketik otomatis (Debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            if(nomorChecklist) fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    // Fungsi Simpan Data
    const handleApiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu.");
            return;
        }
        try {
            await api.post(`/api/submit/pengembalian`, { 
                noUrut: recordData.noUrut,
                tanggalPengembalian: tanggalPengembalian
            });
            
            showModal("Sukses", 'Status pengembalian dokumen berhasil disimpan!');
            fetchRecord(nomorChecklist); // Refresh data
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat menyimpan.";
            showModal("Terjadi Kesalahan", errorMessage);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-xl my-8 border border-gray-100">
            <style jsx>{tableStyles}</style>

            {/* --- HEADER (GARIS HITAM DIHAPUS) --- */}
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <RotateCcw className="text-orange-600" />
                Pengembalian Dokumen (Revisi)
            </h1>
            
            {/* --- SEARCH SECTION --- */}
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 mb-6">
                <label className="block text-sm font-bold text-orange-800 mb-2">Cari Dokumen (Nomor Checklist)</label>
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-orange-400 w-5 h-5" />
                    <input
                        type="text"
                        className="w-full pl-10 p-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white transition-all"
                        value={nomorChecklist}
                        onChange={(e) => setNomorChecklist(e.target.value)}
                        placeholder="Contoh: 600.4/046.10/..."
                    />
                    {loading && <span className="absolute right-3 top-3.5 text-sm text-orange-500 font-medium animate-pulse">Mencari...</span>}
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-600 mt-3 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </div>
            
            {recordData && (
                <div className="animate-fade-in">
                    
                    {/* --- FORM INPUT --- */}
                    <form onSubmit={handleApiSubmit} className="mb-8 p-6 rounded-xl bg-white border-2 border-orange-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Save className="w-5 h-5 text-green-600" /> Proses Pengembalian
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label htmlFor="tanggalPengembalian" className="block mb-2 font-semibold text-gray-700">
                                    Tanggal Dokumen Dikembalikan:
                                </label>
                                <input 
                                    id="tanggalPengembalian"
                                    name="tanggalPengembalian"
                                    type="date" 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={tanggalPengembalian}
                                    onChange={(e) => setTanggalPengembalian(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
                                disabled={loading}
                            >
                                <RotateCcw size={18} />
                                Simpan Status Pengembalian
                            </button>
                        </div>
                    </form>

                    {/* --- TABEL DETAIL DOKUMEN --- */}
                    <div className="mt-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                            <FileText className="text-gray-500" /> Detail Dokumen
                        </h4>
                        <table className="record-table">
                            <tbody>
                                <tr><th>Pemrakarsa</th><td>{recordData.namaPemrakarsa}</td></tr>
                                <tr><th>Nama Kegiatan</th><td>{recordData.namaKegiatan || recordData.jenisKegiatan}</td></tr>
                                <tr><th>Alamat</th><td>{recordData.alamatKegiatan}</td></tr>
                                <tr>
                                    <th>Status Terakhir</th>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                                            recordData.statusTerakhir === 'DIKEMBALIKAN' ? 'bg-orange-500' : 'bg-green-600'
                                        }`}>
                                            {recordData.statusTerakhir || 'PROSES'}
                                        </span>
                                    </td>
                                </tr>
                                {recordData.statusTerakhir === 'DIKEMBALIKAN' && (
                                    <tr>
                                        <th>Tanggal Pengembalian</th>
                                        <td><span className="text-orange-600">{recordData.tanggalPengembalian}</span></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <p className="text-gray-700">{modalInfo.message}</p>
            </Modal>
        </div>
    );
}