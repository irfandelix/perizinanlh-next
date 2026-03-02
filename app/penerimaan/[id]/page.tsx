'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, ClipboardList, CheckCircle, Loader2, Info, User } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormPenerimaanPerbaikan() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalPenyerahanPerbaikan: '',
        petugasPenerimaPerbaikan: '',
        nomorRevisi: '1'
    });

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                if (result.success) {
                    const currentDoc = result.data.find((d: any) => d.noUrut === parseInt(id));
                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        if (currentDoc.tanggalPHP) {
                            setFormData({
                                tanggalPenyerahanPerbaikan: currentDoc.tanggalPHP || '',
                                petugasPenerimaPerbaikan: currentDoc.petugasPenerimaPerbaikan || '',
                                nomorRevisi: '1' // Default revisi 1, bisa disesuaikan
                            });
                        }
                    } else {
                        setModalInfo({ show: true, title: 'Data Tidak Ditemukan', message: 'Dokumen tidak ada di database.', isSuccess: false });
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        if (id) fetchDocData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                noUrut: parseInt(id),
                ...formData
            };

            // Menembak endpoint API tahap 'penerimaan' (Tahap F)
            const response = await api.post('/api/submit/penerimaan', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Tanda Terima Hasil Perbaikan (PHP) berhasil diterbitkan! Nomor: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/penerimaan'); }, 2500);
        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Error server.', isSuccess: false });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-purple-600 mb-3" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.push('/penerimaan')} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-6 transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar Penerimaan
            </button>

            <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
                <div className="bg-purple-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><ClipboardList size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase">Penerimaan Hasil Perbaikan</h1>
                        <p className="text-purple-100 text-sm font-medium mt-1 uppercase tracking-wide">Penerbitan Tanda Terima Dokumen Perbaikan (PHP)</p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 mb-8">
                            <div className="flex items-center gap-2 mb-4 text-purple-700 font-bold text-xs uppercase tracking-widest">
                                <Info size={14} /> Ringkasan Dokumen
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase">Kegiatan</span><p className="font-bold text-gray-800 leading-tight mt-1">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase">Pemrakarsa</span><p className="font-bold text-gray-800 mt-1 flex items-center gap-1.5"><User size={14} className="text-gray-400"/> {docInfo.namaPemrakarsa}</p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Revisi Ke-</label>
                                <select name="nomorRevisi" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 font-bold text-gray-800" value={formData.nomorRevisi} onChange={handleChange}>
                                    <option value="1">Revisi 1</option><option value="2">Revisi 2</option><option value="3">Revisi 3</option><option value="4">Revisi 4</option><option value="5">Revisi 5</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Nama Petugas Penerima</label>
                                <input type="text" name="petugasPenerimaPerbaikan" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 font-bold text-gray-800" placeholder="Masukkan nama lengkap petugas..." value={formData.petugasPenerimaPerbaikan} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Tanggal Penyerahan Berkas</label>
                            <input type="date" name="tanggalPenyerahanPerbaikan" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 font-bold text-gray-800 cursor-pointer" value={formData.tanggalPenyerahanPerbaikan} onChange={handleChange} required />
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button type="submit" disabled={submitLoading} className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-purple-200 flex items-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest">
                                {submitLoading ? <><Loader2 className="animate-spin" size={18} /> Menyimpan...</> : <><Save size={18} /> Simpan Tanda Terima (PHP)</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    {modalInfo.isSuccess ? <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={48} className="text-green-600 animate-bounce" /></div> : <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4"><span className="text-4xl">⚠️</span></div>}
                    <p className="text-gray-700 font-bold leading-relaxed">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}