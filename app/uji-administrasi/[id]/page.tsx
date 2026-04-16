'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, FileText, CheckCircle, Loader2, Info, UploadCloud } from 'lucide-react';
import Modal from '@/components/Modal';

function FormUjiAdministrasiContent() {
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
    const [file, setFile] = useState<File | null>(null); // State untuk file Drive

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
                        if (currentDoc.tanggalUjiBerkas) setTanggal(currentDoc.tanggalUjiBerkas);
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
            // 1. Siapkan FormData (Wajib karena ada upload file)
            const formData = new FormData();
            formData.append('noUrut', id);
            formData.append('tahun', thn || '');
            formData.append('tanggalPenerbitanUa', tanggal);
            
            // Masukkan nama pemrakarsa agar backend bisa buat folder di Drive
            if (docInfo?.namaPemrakarsa) {
                formData.append('namaPemrakarsa', docInfo.namaPemrakarsa);
            }

            // Masukkan file BA jika petugas mengunggahnya
            if (file) {
                formData.append('file', file);
            }

            // 2. Kirim ke API menggunakan fetch
            const response = await fetch('/api/submit/b', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal menyimpan data');
            }

            setModalInfo({ 
                show: true, 
                title: 'Berhasil', 
                message: 'BA Uji Administrasi & File Scan Berhasil Disimpan!', 
                isSuccess: true 
            });
            
            setTimeout(() => router.push('/uji-administrasi'), 2000);
        } catch (error: any) { 
            console.error("Submit Error:", error);
            setModalInfo({ 
                show: true, 
                title: 'Gagal', 
                message: error.message || 'Gagal simpan data.', 
                isSuccess: false 
            }); 
        } finally { 
            setSubmitLoading(false); 
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-10 h-10" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold mb-6 group transition-all">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Daftar
            </button>
            
            <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="bg-orange-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl"><FileText size={28} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Input Uji Administrasi</h1>
                        <p className="text-orange-100 text-xs font-medium uppercase mt-1">TAHUN {thn} | TAHAP B: BA HUA</p>
                    </div>
                </div>
                
                <div className="p-8">
                    {!docInfo ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">⚠️ Data No. {id} Tahun {thn} Tidak Ditemukan.</div>
                    ) : (
                        <>
                        <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 mb-8 flex gap-4">
                            <Info className="text-orange-500 mt-1" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <div className="col-span-1 md:col-span-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</span>
                                    <p className="font-bold text-gray-800 uppercase leading-tight mt-1">{docInfo.namaKegiatan}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Urut / Tahun</span>
                                    <p className="font-black text-orange-600 mt-1">{docInfo.noUrut} / {thn}</p>
                                </div>
                                <div className="md:col-span-3 border-t border-orange-200/50 pt-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pemrakarsa</span>
                                    <p className="font-bold text-gray-700 mt-1">{docInfo.namaPemrakarsa || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Input Tanggal */}
                                <div>
                                    <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest">Tanggal BA Uji Administrasi</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 font-bold text-gray-800 transition-all" 
                                        value={tanggal} 
                                        onChange={(e) => setTanggal(e.target.value)} 
                                        required 
                                    />
                                </div>

                                {/* Input Upload File */}
                                <div>
                                    <label className="block text-xs font-black mb-3 text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                        <UploadCloud size={16} className="text-orange-500"/> Upload Scan BA HUA (PDF)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 font-medium text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer transition-all" 
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Dokumen akan otomatis diarsipkan di folder Drive pemrakarsa.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 border-t border-gray-50">
                                <button type="submit" disabled={submitLoading} className="bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:bg-orange-300 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-all uppercase tracking-widest">
                                    {submitLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Simpan & Upload BA
                                </button>
                            </div>
                        </form>
                        </>
                    )}
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

export default function UjiAdministrasiDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600 w-12 h-12" /></div>}>
            <FormUjiAdministrasiContent />
        </Suspense>
    );
}