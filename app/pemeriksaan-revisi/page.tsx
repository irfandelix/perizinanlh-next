'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, History, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormPemeriksaanRevisi() {
    // 1. Ambil 'id' dari folder [id] dan 'thn' dari URL
    const params = useParams();
    const id = params.id as string; 
    const searchParams = useSearchParams();
    const thn = searchParams.get('thn'); 

    const router = useRouter();
    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });
    
    const [revisiKe, setRevisiKe] = useState('1');
    const [tanggal, setTanggal] = useState('');

    useEffect(() => {
        const fetchDocData = async () => {
            if (!id) return;
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                if (result.success) {
                    // 2. KUNCI UTAMA: Cari berdasarkan _id agar data tidak tertukar/route.ts]
                    const currentDoc = result.data.find((d: any) => d._id === id);
                    
                    if (currentDoc) {
                        setDocInfo(currentDoc);
                    } else {
                        setModalInfo({ show: true, title: 'Tidak Ditemukan', message: 'Data tidak ada di database.', isSuccess: false });
                    }
                }
            } catch (error) { console.error(error); } 
            finally { setLoadingData(false); }
        };
        fetchDocData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            // 3. Tetap kirim noUrut ke API untuk generate nomor surat/route.ts]
            await api.post('/api/submit/e', { 
                noUrut: docInfo.noUrut, 
                tahun: docInfo.tahun, 
                nomorRevisi: revisiKe,
                tanggalRevisi: tanggal 
            });
            setModalInfo({ show: true, title: 'Berhasil', message: `Data Revisi ${revisiKe} Berhasil Disimpan!`, isSuccess: true });
            setTimeout(() => router.push('/pemeriksaan-revisi'), 2000);
        } catch (error: any) { setModalInfo({ show: true, title: 'Gagal', message: 'Gagal simpan data.', isSuccess: false }); } 
        finally { setSubmitLoading(false); }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-6 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><History size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Input Pemeriksaan Revisi</h1>
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-1">TAHUN {thn} | TAHAP E</p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 mb-8 flex gap-4 items-start">
                            <Info className="text-blue-500 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</span><p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pemrakarsa</span><p className="font-bold text-gray-800 mt-1">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Urut / Tahun</span><p className="font-black text-blue-600 mt-1 text-lg">{docInfo.noUrut} / {docInfo.tahun}</p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Revisi Ke-</label>
                                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-800" value={revisiKe} onChange={(e) => setRevisiKe(e.target.value)}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Revisi ke-{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Tanggal BA Revisi</label>
                                <input type="date" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-gray-800" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button type="submit" disabled={submitLoading} className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center gap-3 transition-all uppercase tracking-widest">
                                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Data Revisi
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modalInfo.isSuccess ? <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-4xl mb-4 text-red-500">⚠️</div>}
                    <p className="font-bold text-gray-700 uppercase text-sm tracking-wide">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}