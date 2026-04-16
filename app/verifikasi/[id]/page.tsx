'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, FileCheck, CheckCircle, Loader2, Info, UploadCloud } from 'lucide-react';
import Modal from '@/components/Modal';

export default function FormRisalahPengolah() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; 

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    // State Form
    const [tanggal, setTanggal] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();

                if (result.success) {
                    // Cari data berdasarkan noUrut yang ada di URL
                    const currentDoc = result.data.find((d: any) => d.noUrut === parseInt(id));
                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        if (currentDoc.tanggalRisalah) setTanggal(currentDoc.tanggalRisalah);
                    } else {
                        setModalInfo({ show: true, title: 'Data Tidak Ditemukan', message: 'Dokumen ini tidak ada di database.', isSuccess: false });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            // 1. Gunakan FormData agar bisa mengirim file fisik ke API
            const formData = new FormData();
            formData.append('noUrut', id);
            formData.append('tanggalPembuatanRisalah', tanggal);
            
            // Masukkan nama pemrakarsa untuk penamaan folder di Google Drive
            if (docInfo?.namaPemrakarsa) {
                formData.append('namaPemrakarsa', docInfo.namaPemrakarsa);
            }

            // Masukkan file jika ada
            if (file) {
                formData.append('file', file);
            }

            // 2. Kirim ke API Tahap G
            const response = await fetch('/api/submit/g', {
                method: 'POST',
                body: formData, // Mengirim FormData
            });

            const result = await response.json();
            
            if (!response.ok || !result.success) throw new Error(result.message || "Gagal simpan");

            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Berita Acara Risalah (RPD) & File berhasil diupload! Nomor: ${result.generatedNomor}`,
                isSuccess: true
            });

            setTimeout(() => { router.push('/risalah-pengolah'); }, 2500);
        } catch (error: any) {
            setModalInfo({ 
                show: true, 
                title: 'Gagal Menyimpan', 
                message: error.message || 'Error server.', 
                isSuccess: false 
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-rose-600 mb-3" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold mb-6 transition-all group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Daftar Risalah
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-rose-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><FileCheck size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Input Risalah Pengolah</h1>
                        <p className="text-rose-100 text-xs font-medium uppercase tracking-widest mt-1">Tahap G: Penerbitan Berita Acara Risalah Pengolahan Dokumen (RPD)</p>
                    </div>
                </div>

                <div className="p-8">
                    {docInfo && (
                        <div className="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-6 mb-8 flex gap-4 items-start">
                            <Info className="text-rose-500 shrink-0 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 w-full">
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</span><p className="font-bold text-gray-800 leading-tight mt-1 uppercase">{docInfo.namaKegiatan}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pemrakarsa</span><p className="font-bold text-gray-800 mt-1 uppercase">{docInfo.namaPemrakarsa}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Checklist DLH</span><p className="font-mono text-sm text-rose-700 font-bold mt-1">{docInfo.nomorChecklist || '-'}</p></div>
                                <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Terakhir</span><p><span className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-lg uppercase">{docInfo.statusTerakhir || 'PROSES'}</span></p></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Input Tanggal */}
                            <div>
                                <label className="block text-xs font-black mb-3 text-slate-500 uppercase tracking-widest">Tanggal Pembuatan Risalah</label>
                                <input 
                                    type="date" 
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 font-bold text-slate-800 transition-all" 
                                    value={tanggal} 
                                    onChange={(e) => setTanggal(e.target.value)} 
                                    required 
                                />
                            </div>

                            {/* Input Upload RPD ke Drive */}
                            <div>
                                <label className="block text-xs font-black mb-3 text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                    <UploadCloud size={16} className="text-rose-500"/> Upload File Risalah (PDF)
                                </label>
                                <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-100 font-medium text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer transition-all" 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button type="submit" disabled={submitLoading} className="bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:bg-rose-300 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-rose-100 flex items-center gap-3 transition-all uppercase tracking-widest">
                                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan BA Risalah
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modalInfo.isSuccess ? (
                        <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" />
                    ) : (
                        <div className="text-4xl mb-4 text-red-500">⚠️</div>
                    )}
                    <p className="font-bold text-gray-700 uppercase text-sm tracking-wide leading-relaxed">
                        {modalInfo.message}
                    </p>
                </div>
            </Modal>
        </div>
    );
}