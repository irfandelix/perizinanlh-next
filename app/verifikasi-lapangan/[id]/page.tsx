'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormVerifikasiLapangan() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; // Menangkap [id] dari URL

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalVerlap: '',
    });

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();

                if (result.success) {
                    const currentDoc = result.data.find((d: any) => d.noUrut === parseInt(id));
                    if (currentDoc) setDocInfo(currentDoc);
                    else setModalInfo({ show: true, title: 'Data Tidak Ditemukan', message: 'Dokumen ini tidak ada di database.', isSuccess: false });
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        if (id) fetchDocData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                noUrut: parseInt(id),
                tanggalVerlap: formData.tanggalVerlap,
            };

            const response = await api.post('/api/submit/c', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Berita Acara Verifikasi Lapangan berhasil diterbitkan! Nomor: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/verifikasi-lapangan'); }, 2500);
        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Error server.', isSuccess: false });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-green-600 mb-3" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium mb-6 transition-colors">
                <ArrowLeft size={20} /> Kembali ke Daftar Verifikasi Lapangan
            </button>

            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-green-600 p-6 text-white flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg"><MapPin size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-bold">Input Verifikasi Lapangan</h1>
                        <p className="text-green-100 text-sm mt-1">Tahap C: Penerbitan Berita Acara Tinjauan Lapangan (BA.V)</p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 mb-8 flex gap-4 items-start">
                            <Info className="text-green-500 shrink-0 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 w-full">
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Nama Kegiatan</span><p className="font-semibold text-gray-800">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Pemrakarsa</span><p className="font-semibold text-gray-800">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Lokasi Kegiatan</span><p className="font-semibold text-gray-800">{docInfo.lokasiKegiatan || '-'}</p></div>
                                <div><span className="text-xs font-bold text-gray-500 uppercase">Status Saat Ini</span><p><span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">{docInfo.statusTerakhir || 'PROSES'}</span></p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Tanggal BA Tinjauan Lapangan <span className="text-red-500">*</span></label>
                            <input type="date" name="tanggalVerlap" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition-all" value={formData.tanggalVerlap} onChange={handleChange} required />
                            <p className="text-xs text-gray-500 mt-2">Nomor urut surat BA.V akan otomatis dibuatkan oleh sistem.</p>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <button type="submit" disabled={submitLoading} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
                                {submitLoading ? 'Menyimpan...' : <><Save size={20} /> Simpan BA Lapangan</>}
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