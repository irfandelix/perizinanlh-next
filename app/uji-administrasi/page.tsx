'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, FileText, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormUjiAdministrasi() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // 1. Ambil ID unik (_id) dari folder dan Tahun dari URL/route.ts]
    const id = params.id as string;
    const thn = searchParams.get('thn');

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalPenerbitanUa: '',
    });

    useEffect(() => {
        const fetchDocData = async () => {
            if (!id) return;
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();

                if (result.success) {
                    const allDocs = result.data;
                    
                    // 2. KUNCI DATA: Cari berdasarkan _id (ID unik MongoDB)/route.ts]
                    // Ini memastikan dokumen No. 5 Tahun 2026 tidak tertukar dengan 2025
                    const currentDoc = allDocs.find((d: any) => d._id === id);

                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        if (currentDoc.tanggalUjiBerkas) {
                            setFormData({ tanggalPenerbitanUa: currentDoc.tanggalUjiBerkas });
                        }
                    } else {
                        setModalInfo({ 
                            show: true, 
                            title: 'Data Tidak Ditemukan', 
                            message: `Dokumen dengan ID tersebut tidak ada di database.`, 
                            isSuccess: false 
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                // Pastikan loading dimatikan agar tidak mutar terus
                setLoadingData(false); 
            }
        };
        
        fetchDocData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                // 3. Gunakan noUrut dan tahun dari docInfo yang sudah valid/route.ts]
                noUrut: docInfo.noUrut,
                tahun: docInfo.tahun,
                tanggalPenerbitanUa: formData.tanggalPenerbitanUa,
            };

            const response = await api.post('/api/submit/b', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Berita Acara Uji Administrasi (BA.HUA) berhasil diterbitkan! Nomor: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/uji-administrasi'); }, 2500);
        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Terjadi kesalahan pada server.', isSuccess: false });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin w-12 h-12 text-orange-600 mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Identitas Dokumen...</p>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold mb-6 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
            </button>

            <div className="bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-orange-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><FileText size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Input Uji Administrasi</h1>
                        <p className="text-orange-100 text-xs font-medium uppercase tracking-widest mt-1">
                            TAHUN {thn || docInfo?.tahun} | TAHAP B: BA.HUA
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo ? (
                        <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 mb-8 flex gap-4 items-start">
                            <Info className="text-orange-500 shrink-0 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 w-full">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</span><p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pemrakarsa</span><p className="font-bold text-gray-800 mt-1">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Urut / Tahun</span><p className="font-black text-orange-600 mt-1 text-lg">{docInfo.noUrut} / {docInfo.tahun}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis Dokumen</span><p className="font-black text-slate-700 mt-1 uppercase text-xs">{docInfo.jenisDokumen}</p></div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl font-bold text-center border border-red-100 mb-8">
                            ⚠️ Data Tidak Ditemukan. Pastikan Anda masuk dari halaman Daftar.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                        <div className="max-w-md">
                            <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Tanggal BA Uji Administrasi <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                name="tanggalPenerbitanUa" 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 font-bold text-gray-800 cursor-pointer transition-all" 
                                value={formData.tanggalPenerbitanUa} 
                                onChange={handleChange} 
                                required 
                            />
                            <p className="text-[10px] text-gray-400 mt-3 italic font-medium">Nomor Berita Acara akan otomatis diterbitkan oleh sistem.</p>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button type="submit" disabled={submitLoading || !docInfo} className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-100 flex items-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest">
                                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan BA Administrasi
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modalInfo.isSuccess ? <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-4xl mb-4 text-red-500">⚠️</div>}
                    <p className="font-bold text-gray-700 uppercase text-sm tracking-wide leading-relaxed">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}