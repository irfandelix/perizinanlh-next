'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; 
import Modal from '@/components/Modal'; 

// 1. Definisi Tipe Data
interface RecordData {
    noUrut: string;
    namaPemrakarsa: string;
    jenisKegiatan: string;
    alamatKegiatan: string;
    statusTerakhir: string;
    tanggalPengembalian?: string;
}

const tableStyles = `
    .record-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }
    .record-table th, .record-table td {
        border: 1px solid #e5e7eb;
        padding: 0.75rem;
        text-align: left;
        vertical-align: top;
    }
    .record-table th {
        background-color: #f3f4f6;
        font-weight: 600;
        width: 30%;
    }
    .record-table td span {
        font-weight: bold;
        color: #2563eb;
    }
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
            // --- PERBAIKAN 1: Tambah '/api' dan ubah key jadi 'keyword' ---
            const response = await api.post(`/api/record/find`, { keyword: checklist });
            
            // Ambil data pertama dari array jika backend mengembalikan list
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
            // --- PERBAIKAN 2: Tambah '/api' di depan URL ---
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
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg my-8">
            <style jsx>{tableStyles}</style>

            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Form Pengembalian Dokumen (Revisi)
            </h1>
            
            <fieldset className="border p-4 rounded-md mb-6 bg-gray-50">
                <legend className="font-semibold px-2 text-blue-700">Pilih Dokumen</legend>
                <p className="mb-4 text-sm text-gray-600">
                   Masukkan Nomor Checklist untuk menampilkan detail dokumen sebelum dikembalikan ke pemrakarsa.
                </p>                
                <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full outline-none focus:ring-2 focus:ring-blue-500" 
                    value={nomorChecklist}
                    onChange={(e) => setNomorChecklist(e.target.value)}
                    placeholder="Contoh: 123/DLH/2025..."
                    required
                />
                {loading && <p className="text-blue-500 mt-2 text-sm">Sedang mencari data...</p>}
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </fieldset>
            
            {recordData && (
                <div className="animate-fade-in">
                    <h3 className="font-bold text-lg mb-2">Detail Dokumen Ditemukan</h3>
                    <table className="record-table">
                        <tbody>
                            <tr><th>Nama Pemrakarsa</th><td><span>{recordData.namaPemrakarsa || '-'}</span></td></tr>
                            <tr><th>Jenis Kegiatan</th><td>{recordData.jenisKegiatan || '-'}</td></tr>
                            <tr><th>Alamat Kegiatan</th><td>{recordData.alamatKegiatan || '-'}</td></tr>
                            <tr>
                                <th>Status Terakhir</th>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs text-white ${
                                        recordData.statusTerakhir === 'DIKEMBALIKAN' ? 'bg-orange-500' : 'bg-green-600'
                                    }`}>
                                        {recordData.statusTerakhir || 'PROSES'}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <form onSubmit={handleApiSubmit} className="mt-6 p-5 border border-orange-200 rounded-lg bg-orange-50">
                        <fieldset>
                            <legend className="font-bold text-orange-700 text-lg mb-2">Konfirmasi Pengembalian</legend>
                            <div className="mt-2">
                                <label htmlFor="tanggalPengembalian" className="block mb-1 font-medium text-gray-700">
                                    Tanggal Dokumen Dikembalikan ke Pemrakarsa:
                                </label>
                                <input 
                                    id="tanggalPengembalian"
                                    name="tanggalPengembalian"
                                    type="date" 
                                    className="border border-gray-300 p-2 rounded w-full md:w-1/2 focus:ring-2 focus:ring-orange-500"
                                    value={tanggalPengembalian}
                                    onChange={(e) => setTanggalPengembalian(e.target.value)}
                                    required 
                                />
                            </div>
                        </fieldset>
                        <button 
                            type="submit" 
                            className="mt-4 px-6 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Simpan Tanggal Pengembalian
                        </button>
                    </form>
                </div>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <p>{modalInfo.message}</p>
            </Modal>
        </div>
    );
}