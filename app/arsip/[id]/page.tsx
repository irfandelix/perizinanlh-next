'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Tambahkan Printer & Hash di import lucide-react
import { Save, ArrowLeft, Archive, CheckCircle2, XCircle, Loader2, Info, Hash, Printer } from 'lucide-react';
import Modal from '@/components/Modal';
import api from '@/lib/api';

// Import untuk PDF Generator
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ArsipPrintTemplate } from '@/components/pdf/ArsipPrintTemplate';

export default function FormChecklistArsip() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [doc, setDoc] = useState<any>(null);
    const [modal, setModal] = useState({ show: false, title: '', message: '', isSuccess: false });

    // State lengkap dengan nomor manual
    const [arsipFisik, setArsipFisik] = useState({
        dokumenCetak: false, noDokumenCetak: '',
        pkplhArsip: false, noPkplhArsip: '',
        suratPermohonan: false, noSuratPermohonan: '',
        undanganSidang: false, noUndanganSidang: ''
    });

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await fetch('/api/record/list');
                const result = await res.json();
                if (result.success) {
                    const current = result.data.find((d: any) => d.noUrut === parseInt(id as string));
                    if (current) {
                        setDoc(current);
                        if (current.arsipFisik) setArsipFisik(current.arsipFisik);
                    }
                }
            } catch (err) {
                console.error("Gagal fetch:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    const handleToggle = (key: keyof typeof arsipFisik) => {
        // @ts-ignore - Menghindari error type pada boolean toggle
        setArsipFisik(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArsipFisik(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setSubmitLoading(true);
        try {
            await api.post('/api/submit/arsip', { noUrut: parseInt(id as string), arsipFisik });
            setModal({ show: true, title: 'Berhasil', message: 'Arsip fisik berhasil diperbarui.', isSuccess: true });
            setTimeout(() => router.push('/arsip'), 2000);
        } catch (e) { 
            setModal({ show: true, title: 'Gagal', message: 'Gagal menyimpan data.', isSuccess: false });
        } finally { setSubmitLoading(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-800 w-10 h-10" /></div>;

    // --- KOMPONEN BARIS ITEM (Reusable) ---
    const ItemRow = ({ label, exists, value, manualKey, noKey }: any) => (
        <div className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${exists ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'}`}>
            <div className="flex items-center gap-4 flex-1">
                <div onClick={() => manualKey && handleToggle(manualKey)} className={`cursor-pointer transition-transform active:scale-90`}>
                    {exists ? <CheckCircle2 className="text-emerald-500" size={28} /> : <XCircle className="text-slate-200" size={28} />}
                </div>
                <div className="flex-1">
                    <p className={`text-xs font-black uppercase tracking-wider ${exists ? 'text-emerald-900' : 'text-slate-400'}`}>{label}</p>
                    
                    {manualKey ? (
                        <div className="mt-2 relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input 
                                type="text" 
                                name={noKey}
                                value={value || ''}
                                onChange={handleInputChange}
                                placeholder="Input nomor dokumen fisik..."
                                className="w-full pl-9 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all shadow-inner"
                            />
                        </div>
                    ) : (
                        <p className={`text-[11px] font-mono mt-1 px-3 py-1.5 rounded-lg inline-block ${exists ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-300 bg-slate-50 border border-slate-100'}`}>
                            {value || 'Belum tersedia di sistem'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto my-8 font-sans">
            <button onClick={() => router.push('/arsip')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 group transition-all">
                <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Kembali ke Manajemen Arsip
            </button>

            <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100">
                <div className="bg-slate-800 p-8 text-white flex items-center gap-5">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner"><Archive size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Verifikasi Berkas Fisik</h1>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">Konfirmasi kelengkapan berkas {doc?.noUrut || id}</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* INFO HEADER BOX */}
                    {doc && (
                        <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex items-start gap-4 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-4 opacity-5"><Archive size={80} className="text-slate-900" /></div>
                            <Info className="text-slate-400 mt-1" size={20} />
                            <div className="relative z-10">
                                <h4 className="font-black text-slate-800 uppercase text-sm leading-tight">{doc.namaKegiatan}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-1 italic">{doc.namaPemrakarsa} • {doc.jenisDokumen}</p>
                                <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-tighter">No. Registrasi: {doc.nomorChecklist}</p>
                            </div>
                        </div>
                    )}

                    {/* GRID 11 ITEM ARSIP */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ItemRow label="1. Dokumen Lingkungan Cetak" exists={arsipFisik.dokumenCetak} value={arsipFisik.noDokumenCetak} manualKey="dokumenCetak" noKey="noDokumenCetak" />
                        <ItemRow label="2. PKPLH Arsip" exists={arsipFisik.pkplhArsip} value={arsipFisik.noPkplhArsip} manualKey="pkplhArsip" noKey="noPkplhArsip" />
                        <ItemRow label="3. Uji Administrasi" exists={doc?.nomorUjiBerkas} value={doc?.nomorUjiBerkas} />
                        <ItemRow label="4. BA Verlap" exists={doc?.nomorBAVerlap} value={doc?.nomorBAVerlap} />
                        <ItemRow label="5. BA Pemeriksa / Sidang" exists={doc?.nomorBAPemeriksaan} value={doc?.nomorBAPemeriksaan} />
                        <ItemRow label="6. Surat Permohonan (Awal)" exists={arsipFisik.suratPermohonan} value={arsipFisik.noSuratPermohonan} manualKey="suratPermohonan" noKey="noSuratPermohonan" />
                        <ItemRow label="7. Lembar Registrasi" exists={doc?.nomorChecklist} value={doc?.nomorChecklist} />
                        <ItemRow label="8. Lembar Pengembalian" exists={doc?.tanggalPengembalian} value={doc?.tanggalPengembalian ? `Tgl: ${doc.tanggalPengembalian}` : ''} />
                        <ItemRow label="9. Penerimaan Perbaikan (PHP)" exists={doc?.nomorPHP} value={doc?.nomorPHP} />
                        <ItemRow label="10. Undangan Sidang" exists={arsipFisik.undanganSidang} value={arsipFisik.noUndanganSidang} manualKey="undanganSidang" noKey="noUndanganSidang" />
                        <ItemRow label="11. Penyusunan RPD" exists={doc?.nomorRisalah} value={doc?.nomorRisalah} />
                    </div>

                    {/* FOOTER ACTION: CETAK & SIMPAN */}
                    <div className="pt-10 mt-10 border-t border-slate-100 flex justify-end gap-4">
                        {doc && (
                            <PDFDownloadLink
                                document={<ArsipPrintTemplate data={doc} arsipFisik={arsipFisik} />}
                                fileName={`Arsip_${doc.noUrut}_${doc.namaPemrakarsa.replace(/\s/g, '_')}.pdf`}
                            >
                                {({ loading: pdfLoading }) => (
                                    <button 
                                        type="button"
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-cyan-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Printer size={18} /> {pdfLoading ? 'Loading...' : 'Cetak Lembar Arsip'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}

                        <button 
                            onClick={handleSave} 
                            disabled={submitLoading}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Arsip
                        </button>
                    </div>
                </div>
            </div>

            <Modal show={modal.show} title={modal.title} onClose={() => setModal({ ...modal, show: false })}>
                <div className="p-8 text-center flex flex-col items-center">
                    {modal.isSuccess ? <CheckCircle2 size={60} className="text-emerald-500 mb-4 animate-bounce" /> : <XCircle size={60} className="text-red-500 mb-4" />}
                    <p className="font-bold text-slate-700 leading-relaxed uppercase text-sm tracking-wide">{modal.message}</p>
                </div>
            </Modal>
        </div>
    );
}