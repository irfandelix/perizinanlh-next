'use client';

import React, { useState, useEffect } from 'react';
import { Archive, Search, CheckCircle2, XCircle, Loader2, Save, Hash, Info } from 'lucide-react'; 
import api from '@/lib/api';

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaKegiatan: string;
    namaPemrakarsa: string;
    tahun?: string | number;
    tanggalMasukDokumen: string;
    // Data Otomatis
    nomorUjiBerkas?: string;
    nomorBAVerlap?: string;
    nomorBAPemeriksaan?: string;
    // Data Manual (Arsip)
    arsipFisik?: {
        dokumenCetak: boolean; noDokumenCetak: string;
        pkplhArsip: boolean; noPkplhArsip: string;
        suratPermohonan: boolean; noSuratPermohonan: string;
        undanganSidang: boolean; noUndanganSidang: string;
    };
}

export default function ModeArsipCepat() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/record/list'); 
            const result = await res.json();
            if (result.success) {
                setDataDokumen(result.data);
                const years = Array.from(new Set(result.data.map((d: any) => d.tahun?.toString() || d.tanggalMasukDokumen?.substring(0, 4)))).sort().reverse() as string[];
                setAvailableYears(years);
                if (years.length > 0) setSelectedYear(years[0]);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // Fungsi Update Langsung di Tabel
    const handleQuickUpdate = async (docId: string, noUrut: number, field: string, value: any) => {
        const doc = dataDokumen.find(d => d._id === docId);
        if (!doc) return;

        const updatedArsip = { 
            ...(doc.arsipFisik || { 
                dokumenCetak: false, noDokumenCetak: '', 
                pkplhArsip: false, noPkplhArsip: '',
                suratPermohonan: false, noSuratPermohonan: '',
                undanganSidang: false, noUndanganSidang: '' 
            }),
            [field]: value 
        };

        try {
            setSavingId(docId);
            await api.post('/api/submit/arsip', { noUrut, arsipFisik: updatedArsip });
            // Update state lokal agar tampilan langsung berubah tanpa refresh
            setDataDokumen(prev => prev.map(d => d._id === docId ? { ...d, arsipFisik: updatedArsip } : d));
        } catch (e) { alert("Gagal menyimpan!"); }
        finally { setSavingId(null); }
    };

    const filteredData = dataDokumen.filter((doc) => {
        const docYear = doc.tahun?.toString() || doc.tanggalMasukDokumen?.substring(0, 4);
        return docYear === selectedYear && (
            doc.namaKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.namaPemrakarsa?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg shadow-md"><Archive className="text-white w-6 h-6" /></div>
                            Mode Arsip Cepat (Inline)
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium text-xs uppercase tracking-widest">Input nomor dan centang fisik langsung di tabel tanpa pindah halaman.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari Dokumen..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 outline-none font-bold text-sm shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto mb-6">
                    {availableYears.map((y) => (
                        <button key={y} onClick={() => setSelectedYear(y)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 ${selectedYear === y ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>{y}</button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-800 text-white font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4 w-64">Nama Kegiatan & Pemrakarsa</th>
                                <th className="p-4 border-l border-slate-700">1. Dokumen Cetak</th>
                                <th className="p-4 border-l border-slate-700">2. PKPLH Arsip</th>
                                <th className="p-4 border-l border-slate-700">6. Surat Permohonan</th>
                                <th className="p-4 border-l border-slate-700">10. Undangan Sidang</th>
                                <th className="p-4 border-l border-slate-700 bg-slate-700 text-center">Data Otomatis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((doc) => (
                                <tr key={doc._id} className={`${savingId === doc._id ? 'bg-amber-50 opacity-70' : 'hover:bg-slate-50/50'} transition-all`}>
                                    <td className="p-4 text-center font-bold text-slate-400">{doc.noUrut}</td>
                                    <td className="p-4">
                                        <div className="font-black text-slate-800 uppercase line-clamp-1">{doc.namaKegiatan}</div>
                                        <div className="text-slate-400 mt-0.5 truncate italic">{doc.namaPemrakarsa}</div>
                                    </td>
                                    
                                    {/* Kolom Input Manual 1, 2, 6, 10 */}
                                    {[
                                        { key: 'dokumenCetak', noKey: 'noDokumenCetak', label: 'Cetak' },
                                        { key: 'pkplhArsip', noKey: 'noPkplhArsip', label: 'PKPLH' },
                                        { key: 'suratPermohonan', noKey: 'noSuratPermohonan', label: 'Permohonan' },
                                        { key: 'undanganSidang', noKey: 'noUndanganSidang', label: 'Undangan' }
                                    ].map((item) => {
                                        const isExist = (doc.arsipFisik as any)?.[item.key];
                                        const noVal = (doc.arsipFisik as any)?.[item.noKey] || '';
                                        return (
                                            <td key={item.key} className="p-3 border-l border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleQuickUpdate(doc._id, doc.noUrut, item.key, !isExist)}
                                                        className={`shrink-0 transition-transform active:scale-75 ${isExist ? 'text-emerald-500' : 'text-slate-200'}`}
                                                    >
                                                        {isExist ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                                    </button>
                                                    <input 
                                                        type="text"
                                                        placeholder={`No ${item.label}...`}
                                                        className={`w-full p-1.5 border rounded-lg outline-none text-[10px] font-bold transition-all ${isExist ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100'}`}
                                                        value={noVal}
                                                        onBlur={(e) => handleQuickUpdate(doc._id, doc.noUrut, item.noKey, e.target.value)}
                                                        onChange={(e) => {
                                                            const newData = [...dataDokumen];
                                                            const idx = newData.findIndex(d => d._id === doc._id);
                                                            (newData[idx].arsipFisik as any)[item.noKey] = e.target.value;
                                                            setDataDokumen(newData);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {/* Kolom Ringkasan Data Otomatis */}
                                    <td className="p-3 border-l border-slate-100 bg-slate-50/50">
                                        <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                                            {doc.nomorUjiBerkas && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[8px] font-black" title={doc.nomorUjiBerkas}>UA</span>}
                                            {doc.nomorBAVerlap && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-black" title={doc.nomorBAVerlap}>VL</span>}
                                            {doc.nomorBAPemeriksaan && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[8px] font-black" title={doc.nomorBAPemeriksaan}>BP</span>}
                                            {doc.nomorChecklist && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-black" title={doc.nomorChecklist}>REG</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <Info size={18} className="text-blue-500" />
                    <p className="text-[11px] text-blue-700 font-bold uppercase tracking-tight">
                        Tips: Centang status akan otomatis tersimpan. Untuk nomor dokumen, ketik lalu klik di luar kotak (blur) untuk menyimpan.
                    </p>
                </div>
            </div>
        </div>
    );
}