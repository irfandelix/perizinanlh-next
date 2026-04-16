'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, ClipboardCheck, CheckCircle, Loader2, Info, UploadCloud } from 'lucide-react';
import Modal from '@/components/Modal';
// Jika file api.ts tidak mendukung FormData, kita akan menggunakan fetch bawaan

function FormPemeriksaanContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const id = params.id as string;
    const thn = searchParams.get('thn');

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });
    
    // Form States
    const [tanggal, setTanggal] = useState('');
    const [file, setFile] = useState<File | null>(null); // State baru untuk file Drive

    useEffect(() => {
        const fetchDocData = async () => {
            if (!id || !thn) return;
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                if (result.success) {
                    const currentDoc = result.data.find((d: any) => {
                        const docYear = d.tahun?.toString() || (d.tanggalMasukDokumen ? d.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString());
                        return d.noUrut === parseInt(id) && docYear === thn;
                    });
                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        if (currentDoc.tanggalPemeriksaan) setTanggal(currentDoc.tanggalPemeriksaan);
                    }
                }
            } catch (error) { 
                console.error(error); 
            } finally { 
                setLoadingData(false); 
            }
        };
        fetchDocData();
    }, [id, thn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            // 1. Buat FormData untuk mengirim teks dan file sekaligus
            const formData = new FormData();
            formData.append('noUrut', id);
            formData.append('tahun', thn || '');
            formData.append('tanggalPemeriksaan', tanggal);
            
            // Kirim nama pemrakarsa untuk nama folder di Google Drive
            if (docInfo?.namaPemrakarsa) {
                formData.append('namaPemrakarsa', docInfo.namaPemrakarsa);
            }

            // Lampirkan file jika petugas mengunggahnya
            if (file) {
                formData.append('file', file);
            }

            // 2. Kirim menggunakan fetch bawaan (jangan set Content-Type, biarkan browser yang atur boundary multipart)
            const response = await fetch('/api/submit/d', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal menyimpan data');
            }

            setModalInfo({ show: true, title: 'Berhasil', message: 'BA Pemeriksaan Substansi & File Berhasil Disimpan!', isSuccess: true });
            setTimeout(() => router.push('/pemeriksaan-substansi'), 2000);
        } catch (error: any) { 
            console.error("Submit Error:", error);
            setModalInfo({ show: true, title: 'Gagal', message: error.message || 'Gagal simpan data.', isSuccess: false }); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-6 group transition-all">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Daftar
            </button>
            
            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl"><ClipboardCheck size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase">Pemeriksaan Substansi</h1>
                        <p className="text-indigo-100 text-xs font-medium uppercase mt-1">TAHUN {thn} | TAHAP D</p>
                    </div>
                </div>
                
                <div className="p-8">
                    {!docInfo ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">⚠️ Data No. {id} Tahun {thn} Tidak Ditemukan.</div>
                    ) : (
                        <>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 mb-8 flex gap-4">
                            <Info className="text-indigo-500 mt-1" />
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Kegiatan</span>
                                    <p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Pemrakarsa</span>
                                    <p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaPemrakarsa || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">No Urut / Tahun</span>
                                    <p className="font-black text-indigo-600 mt-1">{docInfo.noUrut} / {thn}</p>
                                </div>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Input Tanggal */}
                                <div>
                                    <label className="block text-xs font-black mb-3 text-gray-500 uppercase">Tanggal BA Pemeriksaan</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-gray-800" 
                                        value={tanggal} 
                                        onChange={(e) => setTanggal(e.target.value)} 
                                        required 
                                    />
                                </div>

                                {/* Input Upload File Drive */}
                                <div>
                                    <label className="block text-xs font-black mb-3 text-gray-500 uppercase flex items-center gap-1">
                                        <UploadCloud size={16} className="text-indigo-500"/> Upload BA (PDF/Scan)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer transition-all" 
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">File otomatis tersimpan di Google Drive LH.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 border-t border-gray-50">
                                <button type="submit" disabled={submitLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-colors">
                                    {submitLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
                                    Simpan & Upload
                                </button>
                            </div>
                        </form>
                        </>
                    )}
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

export default function PemeriksaanDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>}>
            <FormPemeriksaanContent />
        </Suspense>
    );
}