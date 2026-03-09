'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, MapPin, CheckCircle, Loader2, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

function FormVerlapContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const id = params.id as string;
    const thn = searchParams.get('thn');

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });
    const [tanggal, setTanggal] = useState('');

    useEffect(() => {
        const fetchDocData = async () => {
            if (!id || !thn) return;
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                if (result.success) {
                    const currentDoc = result.data.find((d: any) => d.noUrut === parseInt(id) && d.tahun?.toString() === thn);
                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        if (currentDoc.tanggalVerlap) setTanggal(currentDoc.tanggalVerlap);
                    }
                }
            } catch (error) { console.error(error); } 
            finally { setLoadingData(false); }
        };
        fetchDocData();
    }, [id, thn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/api/submit/c', { noUrut: parseInt(id), tahun: thn, tanggalVerlap: tanggal });
            setModalInfo({ show: true, title: 'Berhasil', message: 'BA Verifikasi Lapangan Berhasil Disimpan!', isSuccess: true });
            setTimeout(() => router.push('/verifikasi-lapangan'), 2000);
        } catch (error) { setModalInfo({ show: true, title: 'Gagal', message: 'Gagal simpan data.', isSuccess: false }); } 
        finally { setSubmitLoading(false); }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 font-bold mb-6 group transition-all"><ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Daftar</button>
            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-amber-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl"><MapPin size={28} /></div>
                    <div><h1 className="text-2xl font-black uppercase">Verifikasi Lapangan</h1><p className="text-amber-100 text-xs font-medium uppercase mt-1">TAHUN {thn} | TAHAP C</p></div>
                </div>
                <div className="p-8">
                    {!docInfo ? <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">⚠️ Data No. {id} Tahun {thn} Tidak Ditemukan.</div> : (
                        <>
                        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 mb-8 flex gap-4"><Info className="text-amber-500 mt-1" />
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase">Kegiatan</span><p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase">No Urut / Tahun</span><p className="font-black text-amber-600 mt-1">{docInfo.noUrut} / {docInfo.tahun}</p></div>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="max-w-md"><label className="block text-xs font-black mb-3 text-gray-500 uppercase">Tanggal Verifikasi Lapangan</label>
                            <input type="date" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 font-bold text-gray-800" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required /></div>
                            <div className="flex justify-end pt-8 border-t border-gray-50"><button type="submit" disabled={submitLoading} className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3">{submitLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Simpan BA</button></div>
                        </form>
                        </>
                    )}
                </div>
            </div>
            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}><div className="p-8 text-center flex flex-col items-center">{modalInfo.isSuccess ? <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-4xl mb-4 text-red-500">⚠️</div>}<p className="font-bold text-gray-700 uppercase text-sm">{modalInfo.message}</p></div></Modal>
        </div>
    );
}

export default function VerlapDetailPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-600 w-12 h-12" /></div>}><FormVerlapContent /></Suspense>;
}