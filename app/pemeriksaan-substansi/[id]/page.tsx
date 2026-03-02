'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, BookOpen, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormPemeriksaanSubstansi() {
    const params = useParams();
    const router = useRouter();
    const noUrut = params.noUrut as string;

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalPemeriksaan: '',
    });

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const response = await api.get('/api/rekap');
                const allDocs = response.data.data;
                const currentDoc = allDocs.find((d: any) => d.noUrut === parseInt(noUrut));

                if (currentDoc) setDocInfo(currentDoc);
                else setModalInfo({ show: true, title: 'Data Tidak Ditemukan', message: 'Dokumen ini tidak ada.', isSuccess: false });
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        if (noUrut) fetchDocData();
    }, [noUrut]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                noUrut: parseInt(noUrut),
                tanggalPemeriksaan: formData.tanggalPemeriksaan,
            };

            const response = await api.post('/api/submit/d', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Berita Acara Rapat Pemeriksaan berhasil diterbitkan! Nomor: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/pemeriksaan-substansi'); }, 2500);
        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Error server.', isSuccess: false });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-indigo-600 mb-3" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-6 transition-colors">
                <ArrowLeft size={20} /> Kembali ke Daftar Pemeriksaan
            </button>

            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg"><BookOpen size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-bold">Input Pemeriksaan Substansi</h1>
                        <p className="text-indigo-100 text-sm mt-1">Tahap D: Penerbitan Berita Acara Pemeriksaan Dokumen (BA.P)</p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 mb-8 flex gap-4 items-start">
                            <Info className="text-indigo-500 shrink-0 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 w-full">
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Nama Kegiatan</span><p className="font-semibold text-gray-800">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Pemrakarsa</span><p className="font-semibold text-gray-800">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Tgl & No. BA Verlap (Selesai)</span><p className="font-semibold text-green-700">{docInfo.nomorBAVerlap} {docInfo.tanggalVerlap ? `(${docInfo.tanggalVerlap})` : ''}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Status Saat Ini</span><p><span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">{docInfo.statusTerakhir || 'PROSES'}</span></p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Tanggal Rapat / BA Pemeriksaan <span className="text-red-500">*</span></label>
                            <input type="date" name="tanggalPemeriksaan" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all" value={formData.tanggalPemeriksaan} onChange={handleChange} required />
                            <p className="text-xs text-gray-500 mt-2">Nomor .../BA.P/... akan di-generate otomatis.</p>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <button type="submit" disabled={submitLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : <><Save size={20} /> Simpan Hasil Rapat (BA.P)</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="flex flex-col items-center justify-center p-4">
                    {modalInfo.isSuccess ? <CheckCircle size={50} className="text-green-500 mb-4 animate-bounce" /> : <div className="text-red-500 mb-4 text-4xl">⚠️</div>}
                    <p className="text-center text-gray-700 font-medium">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}