'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, ArrowRightCircle, CheckCircle, Loader2, Info, User } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

export default function FormPenyerahanKembali() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; // Menangkap noUrut dari URL

    const [loadingData, setLoadingData] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [docInfo, setDocInfo] = useState<any>(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        tanggalPengembalian: '',
    });

    useEffect(() => {
        const fetchDocData = async () => {
            try {
                // Mengambil data dari API list yang sudah terbukti cepat
                const res = await fetch('/api/record/list'); 
                const result = await res.json();

                if (result.success) {
                    // Mencari dokumen berdasarkan noUrut yang dikirim di URL
                    const currentDoc = result.data.find((d: any) => d.noUrut === parseInt(id));

                    if (currentDoc) {
                        setDocInfo(currentDoc);
                        // Jika sudah pernah diisi, masukkan datanya ke form
                        if (currentDoc.tanggalPengembalian) {
                            setFormData({ tanggalPengembalian: currentDoc.tanggalPengembalian });
                        }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const payload = {
                noUrut: parseInt(id),
                tanggalPengembalian: formData.tanggalPengembalian,
            };

            // Mengirim ke endpoint API tahap 'pengembalian'
            await api.post('/api/submit/pengembalian', payload);
            
            setModalInfo({
                show: true,
                title: 'Berhasil Disimpan',
                message: `Status dokumen berhasil diubah menjadi 'DIKEMBALIKAN' ke pemrakarsa.`,
                isSuccess: true
            });

            // Redirect kembali ke daftar setelah 2.5 detik
            setTimeout(() => { router.push('/pengembalian'); }, 2500);
        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Gagal terhubung ke server.', isSuccess: false });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-orange-600 mb-3" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto my-8 font-sans">
            <button onClick={() => router.push('/pengembalian')} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold mb-6 transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar Pengembalian
            </button>

            <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
                {/* Header Card */}
                <div className="bg-orange-600 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><ArrowRightCircle size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Penyerahan Kembali Dokumen</h1>
                        <p className="text-orange-100 text-sm font-medium mt-1">Mencatat tanggal pengembalian berkas revisi kepada pemrakarsa/konsultan.</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* Ringkasan Dokumen */}
                    {docInfo && (
                        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
                             <div className="absolute right-0 top-0 p-4 opacity-5"><ArrowRightCircle size={100} className="text-orange-900" /></div>
                             <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 text-orange-700 font-bold text-xs uppercase tracking-widest">
                                    <Info size={14} /> Informasi Dokumen Aktif
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Judul Kegiatan</span>
                                        <p className="font-bold text-gray-800 leading-tight mt-1">{docInfo.namaKegiatan}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Pemrakarsa / Konsultan</span>
                                        <p className="font-bold text-gray-800 flex items-center gap-1.5 mt-1"><User size={14} className="text-gray-400" /> {docInfo.namaPemrakarsa}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Nomor Checklist Registrasi</span>
                                        <p className="font-mono text-xs text-orange-600 font-bold mt-1">{docInfo.nomorChecklist || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Status Terakhir</span>
                                        <p className="mt-1"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-lg border border-yellow-200">{docInfo.statusTerakhir || 'PROSES'}</span></p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-black mb-3 text-gray-700 uppercase tracking-wide">Tanggal Penyerahan Berkas <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="tanggalPengembalian" 
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-800 cursor-pointer" 
                                    value={formData.tanggalPengembalian} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-3 font-medium flex items-center gap-1.5 italic">
                                <Info size={12} /> Tanggal ini akan tercatat sebagai bukti pengembalian dokumen ke pihak pemrakarsa.
                            </p>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-gray-50">
                            <button 
                                type="submit" 
                                disabled={submitLoading} 
                                className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-200 flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-wait uppercase tracking-widest"
                            >
                                {submitLoading ? (
                                    <> <Loader2 className="animate-spin" size={18} /> Menyimpan... </>
                                ) : (
                                    <> <Save size={18} /> Simpan Pengembalian </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={() => setModalInfo({ ...modalInfo, show: false })}>
                <div className="flex flex-col items-center justify-center p-6">
                    {modalInfo.isSuccess ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={48} className="text-green-600 animate-bounce" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">⚠️</span>
                        </div>
                    )}
                    <p className="text-center text-gray-700 font-bold leading-relaxed">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}