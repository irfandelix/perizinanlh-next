'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, FileEdit, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormPemeriksaanRevisi() {
    const params = useParams();
    const router = useRouter();
    const noUrut = params.noUrut as string;

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    // State untuk form input Tahap E
    const [formData, setFormData] = useState({
        tanggalRevisi: '',
        nomorRevisi: '1' // Default ke Revisi 1
    });

    // Ambil data dokumen berdasarkan noUrut agar petugas tahu dokumen apa yang sedang direvisi
    useEffect(() => {
        const fetchDocData = async () => {
            try {
                // Menggunakan API rekap yang sudah ada, lalu kita filter di frontend
                const response = await api.get('/api/rekap');
                const allDocs = response.data.data;
                const currentDoc = allDocs.find((d: any) => d.noUrut === parseInt(noUrut));

                if (currentDoc) {
                    setDocInfo(currentDoc);
                } else {
                    setModalInfo({ show: true, title: 'Data Tidak Ditemukan', message: 'Dokumen dengan No Urut ini tidak ada.', isSuccess: false });
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoadingData(false);
            }
        };

        if (noUrut) fetchDocData();
    }, [noUrut]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            // Menembak ke API tahap 'e' yang sudah kita buat sebelumnya
            const payload = {
                noUrut: parseInt(noUrut),
                tanggalRevisi: formData.tanggalRevisi,
                nomorRevisi: formData.nomorRevisi
            };

            const response = await api.post('/api/submit/e', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Berita Acara Revisi ke-${formData.nomorRevisi} berhasil dicatat! Nomor Ter-generate: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            // Set timeout sebentar sebelum kembali ke halaman tabel
            setTimeout(() => {
                router.push('/tahap-e'); // Sesuaikan dengan link halaman tabel daftar revisi kamu
            }, 2500);

        } catch (error: any) {
            setModalInfo({
                show: true,
                title: 'Gagal Menyimpan',
                message: error.response?.data?.message || 'Terjadi kesalahan pada server.',
                isSuccess: false
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const closeModal = () => setModalInfo({ ...modalInfo, show: false });

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-blue-600">
                    <Loader2 className="animate-spin w-10 h-10 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">Memuat data dokumen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto my-8">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Kembali ke Daftar Revisi
            </button>

            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <FileEdit size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Input Pemeriksaan Revisi</h1>
                        <p className="text-blue-100 text-sm mt-1">Tahap E: Penerbitan BA Pemeriksaan Dokumen Revisi (BA.P)</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* INFO DOKUMEN READ-ONLY */}
                    {docInfo && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8 flex gap-4 items-start">
                            <Info className="text-blue-500 shrink-0 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 w-full">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Nama Kegiatan</span>
                                    <p className="font-semibold text-gray-800">{docInfo.namaKegiatan}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Pemrakarsa</span>
                                    <p className="font-semibold text-gray-800">{docInfo.namaPemrakarsa}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">No. Checklist DLH</span>
                                    <p className="font-mono text-sm text-gray-700 font-medium">{docInfo.nomorChecklist || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Status Saat Ini</span>
                                    <p><span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">{docInfo.statusTerakhir}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FORM INPUT TAHAP E */}
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Revisi Ke- <span className="text-red-500">*</span></label>
                                <select 
                                    name="nomorRevisi" 
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium" 
                                    value={formData.nomorRevisi} 
                                    onChange={handleChange}
                                >
                                    <option value="1">Revisi 1</option>
                                    <option value="2">Revisi 2</option>
                                    <option value="3">Revisi 3</option>
                                    <option value="4">Revisi 4</option>
                                    <option value="5">Revisi 5</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Sistem akan otomatis memberikan penomoran .../BA.P.1/..., BA.P.2/..., dst.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Tanggal BA Pemeriksaan Revisi <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    name="tanggalRevisi" 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all" 
                                    value={formData.tanggalRevisi} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={submitLoading} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait"
                            >
                                {submitLoading ? 'Menyimpan...' : <><Save size={20} /> Simpan Proses Revisi</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <div className="flex flex-col items-center justify-center p-4">
                    {modalInfo.isSuccess ? <CheckCircle size={50} className="text-green-500 mb-4 animate-bounce" /> : <div className="text-red-500 mb-4 text-4xl">⚠️</div>}
                    <p className="text-center text-gray-700 font-medium">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}