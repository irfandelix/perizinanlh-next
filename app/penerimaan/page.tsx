'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; 
import Modal from '@/components/Modal'; 

const tableStyles = `
    .record-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
    .record-table th, .record-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; vertical-align: top; }
    .record-table th { background-color: #f3f4f6; font-weight: 600; width: 30%; }
    .record-table td span { font-weight: bold; color: #2563eb; }
`;

export default function FormPenerimaan() {
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState<any>(null); // Pakai any biar simpel dulu
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State untuk form input
    const [formData, setFormData] = useState({ 
        tanggalPenyerahanPerbaikan: '',
        petugasPenerimaPerbaikan: '',
        nomorRevisi: '1' // Default ke PHP Ke-1
    });

    // State untuk Modal Popup
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModalInfo({ ...modalInfo, show: false });
    const showModal = (title: string, message: string) => setModalInfo({ show: true, title, message });

    // Fungsi Cari Dokumen
    const fetchRecord = useCallback(async (checklist: string) => {
        if (!checklist) { setRecordData(null); setError(''); return; }
        setLoading(true);
        setError('');
        try {
            // --- BAGIAN INI YANG DIGANTI/DIPASTIKAN ---
            
            // KODE LAMA ANDA:
            // const response = await api.post(`/record/find`, { nomorChecklist: checklist });

            // KODE BARU (Sesuaikan key dengan backend 'keyword'):
            const response = await api.post(`/api/record/find`, { keyword: checklist });

            // ------------------------------------------

            setRecordData(response.data.data);
            
            // Debugging (Opsional): Cek di Console browser apakah data masuk
            console.log("Data Ditemukan:", response.data.data);

        } catch (err: any) {
            console.error("Error Fetching:", err); // Tambah log error
            setRecordData(null);
            setError(err.response?.data?.message || 'Gagal mengambil data.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Efek mengetik (debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            if(nomorChecklist) fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    // Handle Perubahan Input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- FUNGSI SUBMIT UTAMA ---
    const handleApiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu.");
            return;
        }
        try {
            // PENTING: Kita kirim ke '/submit/f' 
            // 'f' ini akan ditangkap oleh [tahap] di backend
            const response = await api.post(`/submit/f`, { 
                noUrut: recordData.noUrut,
                ...formData 
            });
            
            if (response.data.success) {
                // Refresh data agar tabel update
                fetchRecord(nomorChecklist);
                
                // Reset form input
                setFormData(prev => ({ 
                    ...prev,
                    tanggalPenyerahanPerbaikan: '', 
                    petugasPenerimaPerbaikan: ''
                }));

                // Tampilkan pesan sukses
                showModal("Sukses", response.data.message);

                // Opsional: Buka tab baru untuk cetak tanda terima (jika fitur cetak sudah ada)
                // window.open(`/penerimaan/${recordData.noUrut}?revisi=${formData.nomorRevisi}`, '_blank');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat menyimpan.";
            showModal("Gagal", errorMessage);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-lg my-8">
            <style jsx>{tableStyles}</style>
            
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Penerimaan Hasil Perbaikan Dokumen (Tahap F)
            </h1>

            {/* --- FORM PENCARIAN --- */}
            <fieldset className="border p-4 rounded-md mb-6 bg-gray-50">
                <legend className="font-semibold px-2 text-blue-700">Cari Dokumen</legend>
                <input
                    type="text"
                    className="border border-gray-300 p-2 rounded w-full outline-none"
                    value={nomorChecklist}
                    onChange={(e) => setNomorChecklist(e.target.value)}
                    placeholder="Masukkan Nomor Checklist..."
                    required
                />
                {loading && <p className="text-blue-500 mt-2 text-sm">Sedang mencari...</p>}
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </fieldset>
            
            {recordData && (
                <>
                {/* --- FORM INPUT DATA BARU --- */}
                <form onSubmit={handleApiSubmit} className="mb-8 border p-5 rounded-lg bg-blue-50 border-blue-100">
                    <fieldset>
                        <legend className="font-bold text-lg text-blue-800 mb-4">Input Data PHP</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">PHP Ke-Berapa?</label>
                                <select 
                                    name="nomorRevisi" 
                                    className="border p-2 rounded w-full"
                                    value={formData.nomorRevisi} 
                                    onChange={handleChange}
                                >
                                    <option value="1">PHP Ke-1 (Awal)</option>
                                    <option value="2">PHP Ke-2</option>
                                    <option value="3">PHP Ke-3</option>
                                    <option value="4">PHP Ke-4</option>
                                    <option value="5">PHP Ke-5</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Tanggal Terima</label>
                                <input 
                                    name="tanggalPenyerahanPerbaikan"
                                    type="date" 
                                    className="border p-2 rounded w-full"
                                    value={formData.tanggalPenyerahanPerbaikan}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nama Petugas</label>
                                <input 
                                    name="petugasPenerimaPerbaikan"
                                    type="text"
                                    className="border p-2 rounded w-full"
                                    value={formData.petugasPenerimaPerbaikan}
                                    onChange={handleChange}
                                    placeholder="Nama petugas di MPP"
                                    required 
                                />
                            </div>
                        </div>
                    </fieldset>
                    <button 
                        type="submit" 
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
                        disabled={loading}
                    >
                        Simpan Data
                    </button>
                </form>

                {/* --- TABEL HISTORY --- */}
                <div className="animate-fade-in">
                    <h4 className="font-bold text-lg mb-2">History Dokumen</h4>
                    <table className="record-table">
                        <tbody>
                            <tr><th>Pemrakarsa</th><td>{recordData.namaPemrakarsa}</td></tr>
                            <tr><th>Kegiatan</th><td>{recordData.namaKegiatan}</td></tr>
                            
                            {/* Menampilkan PHP Awal (Revisi 1) */}
                            {recordData.nomorPHP && (
                                <tr>
                                    <th>PHP Ke-1</th>
                                    <td>
                                        No: <span>{recordData.nomorPHP}</span><br/>
                                        Tgl: {recordData.tanggalPHP} (Penerima: {recordData.petugasPenerimaPerbaikan})
                                    </td>
                                </tr>
                            )}

                            {/* Menampilkan PHP 2 (Revisi 2) */}
                            {recordData.nomorPHP1 && (
                                <tr>
                                    <th>PHP Ke-2</th>
                                    <td>
                                        No: <span>{recordData.nomorPHP1}</span><br/>
                                        Tgl: {recordData.tanggalPHP1} (Penerima: {recordData.petugasPHP1})
                                    </td>
                                </tr>
                            )}
                            
                            {/* Lanjutkan logika tabel untuk PHP 3, 4, 5 jika perlu */}
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