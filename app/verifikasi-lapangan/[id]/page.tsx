'use client';

import React, { useState, useEffect } from 'react';
// 1. IMPORT YANG BENAR: lucide-react (bukan center)
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, FileText, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormUjiAdministrasi() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Ambil ID dari URL dan Tahun dari Query String (?thn=2026)
    const thn = searchParams.get('thn'); 
    const id = params.id as string;

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalPenerbitanUa: '',
    });

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();

                if (result.success) {
                    const allDocs = result.data;
                    
                    // KUNCI DATA: Harus sama No Urut DAN sama Tahunnya
                    const currentDoc = allDocs.find((d: any) => 
                        d.noUrut === parseInt(id) && 
                        d.tahun?.toString() === thn
                    );

                    if (currentDoc) {
                        setDocInfo(currentDoc);
                    } else {
                        setModalInfo({ 
                            show: true, 
                            title: 'Data Tidak Ditemukan', 
                            message: `Dokumen No. ${id} Tahun ${thn} tidak ada di database.`, 
                            isSuccess: false 
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        
        if (id && thn) fetchDocData();
    }, [id, thn]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                noUrut: parseInt(id),
                tahun: thn, // Kirim tahun agar update-nya tepat sasaran
                tanggalPenerbitanUa: formData.tanggalPenerbitanUa,
            };

            const response = await api.post('/api/submit/b', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `BA Uji Administrasi berhasil! Nomor: ${response.data.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/uji-administrasi'); }, 2500);
        } catch (error: any) {
            setModalInfo({ 
                show: true, 
                title: 'Gagal Menyimpan', 
                message: error.response?.data?.message || 'Error server.', 
                isSuccess: false 
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-orange-600" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold mb-6 transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-orange-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><FileText size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Input Uji Administrasi</h1>
                        <p className="text-orange-100 text-xs font-medium uppercase tracking-widest mt-1">
                            DOKUMEN TAHUN {thn} | Tahap B
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 mb-8 flex gap-4 items-start">
                            <Info className="text-orange-500 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</span><p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pemrakarsa</span><p className="font-bold text-gray-800 mt-1">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Urut / Tahun</span><p className="font-black text-orange-600 mt-1 text-lg">{docInfo.noUrut} / {docInfo.tahun}</p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="max-w-md">
                            <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Tanggal BA Uji Administrasi</label>
                            <input 
                                type="date" 
                                name="tanggalPenerbitanUa" 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 font-bold text-gray-800 transition-all" 
                                value={formData.tanggalPenerbitanUa} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button type="submit" disabled={submitLoading} className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-100 flex items-center gap-3 transition-all">
                                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan BA
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modalInfo.isSuccess ? <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-4xl mb-4 text-red-500">⚠️</div>}
                    <p className="font-bold text-gray-700 uppercase text-sm">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}