'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, FileCheck, Loader2, Info, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormInputRisalah() {
    // 1. UPDATE: Ambil params secara fleksibel (antisipasi nama folder [id] atau [noUrut])
    const params = useParams();
    const rawId = params.id || params.noUrut; 
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [doc, setDoc] = useState<any>(null);
    const [tanggal, setTanggal] = useState('');
    const [modal, setModal] = useState({ show: false, title: '', message: '', isSuccess: false });

    useEffect(() => {
        const fetchDoc = async () => {
            if (!id) return;
            try {
                const res = await fetch('/api/record/list');
                const result = await res.json();
                if (result.success) {
                    // CARI BERDASARKAN _id (PASTI UNIK & TIDAK TERTUKAR)
                    const current = result.data.find((d: any) => d._id === id);
                    
                    if (current) {
                        setDoc(current);
                        if (current.tanggalRisalah) setTanggal(current.tanggalRisalah);
                    }
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchDoc();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            // Tetap kirim noUrut ke API untuk generate nomor surat, 
            // tapi kita ambil dari object 'doc' yang sudah benar
            const res = await api.post('/api/submit/g', { 
                noUrut: doc.noUrut, 
                tanggalPembuatanRisalah: tanggal 
            });
            // ... (sisanya sama)
                
                setModal({ 
                    show: true, 
                    title: 'Berhasil', 
                    message: `Risalah Pengolah Data Berhasil Disimpan! Nomor: ${res.data.generatedNomor}`, 
                    isSuccess: true 
                });
                
                // Redirect ke halaman daftar risalah
                setTimeout(() => router.push('/risalah-pengolah'), 2500);
            } catch (err: any) {
                setModal({ 
                    show: true, 
                    title: 'Gagal', 
                    message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.', 
                    isSuccess: false 
                });
            } finally { 
                setSubmitLoading(false); 
            }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-rose-600 w-10 h-10" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.push('/risalah-pengolah')} className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold mb-6 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Daftar Risalah
            </button>

            <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100">
                <div className="bg-rose-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><FileCheck size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Finalisasi Risalah (RPD)</h1>
                        <p className="text-rose-100 text-xs font-medium uppercase tracking-widest mt-1">Penerbitan Berkas Risalah Pengolahan Data Lingkungan</p>
                    </div>
                </div>

                <div className="p-8">
                    {doc ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 mb-8 flex items-start gap-4">
                            <Info className="text-rose-500 mt-1" size={20} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kegiatan</span><p className="font-bold text-slate-800 leading-tight mt-1 uppercase">{doc.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pemrakarsa</span><p className="font-bold text-slate-800 mt-1">{doc.namaPemrakarsa}</p></div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl mb-8 border border-amber-200 font-bold text-sm">
                            ⚠️ Data Dokumen No. {id} tidak ditemukan. Pastikan nomor urut benar.
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-md">
                            <label className="block text-xs font-black mb-3 text-slate-500 uppercase tracking-widest">Tanggal Pembuatan Risalah</label>
                            <input 
                                type="date" 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-slate-800 cursor-pointer transition-all" 
                                value={tanggal} 
                                onChange={(e) => setTanggal(e.target.value)} 
                                required 
                            />
                            <p className="text-[10px] text-slate-400 mt-3 italic font-medium">Nomor RPD akan otomatis diterbitkan oleh sistem setelah Anda menekan tombol simpan.</p>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-slate-50">
                            <button type="submit" disabled={submitLoading || !doc} className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-rose-200 flex items-center gap-3 transition-all disabled:opacity-50 uppercase tracking-widest">
                                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan & Terbitkan RPD
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modal.show} title={modal.title} onClose={() => setModal({ ...modal, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modal.isSuccess ? <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-4xl mb-4">⚠️</div>}
                    <p className="font-bold text-slate-700 leading-relaxed uppercase text-sm tracking-wide">{modal.message}</p>
                </div>
            </Modal>
        </div>
    );
}