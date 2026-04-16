'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import Modal from '@/components/Modal';
import { ExternalLink, FileText } from 'lucide-react';

export default function FormKantorLH() {
    // --- STATE UTAMA ---
    const [nomorChecklist, setNomorChecklist] = useState('');
    const [recordData, setRecordData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('B');

    // --- STATE FORM PER TAHAP ---
    const [tahapBData, setTahapBData] = useState({ tanggalPenerbitanUa: '' });
    const [tahapCData, setTahapCData] = useState({ tanggalVerifikasi: '' });
    const [tahapDData, setTahapDData] = useState({ tanggalPemeriksaan: '' });
    const [tahapEData, setTahapEData] = useState({ tanggalRevisi: '', nomorRevisi: '1' });
    const [tahapGData, setTahapGData] = useState({ tanggalPembuatanRisalah: '' });
    const [arsipData, setArsipData] = useState<{ nomorIzinTerbit: string, checklistArsip: Record<string, boolean> }>({ nomorIzinTerbit: '', checklistArsip: {} });
    const [pengembalianData, setPengembalianData] = useState({ tanggalPengembalian: '', keteranganPengembalian: '' });

    // --- STATE MODAL ---
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModalInfo({ ...modalInfo, show: false });
    const showModal = (title: string, message: string) => setModalInfo({ show: true, title, message });

    // --- FETCH DATA ---
    const fetchRecord = useCallback(async (checklist: string) => {
        if (!checklist) {
            setRecordData(null); setError(''); return;
        }
        setLoading(true); setError('');
        
        try {
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomorChecklist: checklist })
            });
            const result = await res.json();
            
            if (result.success) {
                setRecordData(result.data);
            } else {
                setRecordData(null);
                if(checklist.length > 5) setError(result.message); 
            }
        } catch (err) {
            setRecordData(null);
            setError('Gagal mengambil data server.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            if(nomorChecklist) fetchRecord(nomorChecklist);
        }, 800);
        return () => clearTimeout(handler);
    }, [nomorChecklist, fetchRecord]);

    // Pre-fill Form Data saat Record Ditemukan
    useEffect(() => {
        if (recordData) {
            setTahapBData({ tanggalPenerbitanUa: recordData.tanggalUjiBerkas || '' });
            setTahapCData({ tanggalVerifikasi: recordData.tanggalVerlap || '' });
            setTahapDData({ tanggalPemeriksaan: recordData.tanggalPemeriksaan || '' });
            setTahapGData({ tanggalPembuatanRisalah: recordData.tanggalRisalah || '' });
            setPengembalianData({ tanggalPengembalian: recordData.tanggalPengembalian || '', keteranganPengembalian: recordData.keteranganPengembalian || '' });
            
            const savedChecks = recordData.checklistArsip ? recordData.checklistArsip.split(',').map((item: string) => item.trim()) : [];
            const checkState: any = {};
            savedChecks.forEach((item: string) => { if(item) checkState[item] = true; });
            setArsipData({
                nomorIzinTerbit: recordData.nomorIzinTerbit || '',
                checklistArsip: checkState
            });
        }
    }, [recordData]);

    // --- HANDLE SUBMIT API MENGGUNAKAN FORMDATA ---
    const handleApiSubmit = async (endpoint: string, payload: any, callback?: () => void) => {
        if (!recordData) {
            showModal("Error", "Pilih dokumen yang valid terlebih dahulu.");
            return;
        }

        // Validasi Logika Tahap E & G
        if (endpoint === 'e' || endpoint === 'g') {
            const fileCExists = recordData.fileTahapC;
            const fileDExists = recordData.fileTahapD;
            if (!fileCExists && !fileDExists) {
                showModal("Tahap Belum Terbuka", "Harap upload file BA Verifikasi Lapangan (Tahap C) atau BA Pemeriksaan (Tahap D) terlebih dahulu.");
                return;
            }
        }

        try {
            // PERUBAHAN: Ubah cara kirim menjadi FormData agar sinkron dengan API Backend
            const formData = new FormData();
            formData.append('noUrut', recordData.noUrut.toString());
            
            // Tambahkan namaPemrakarsa agar API bisa membuat folder Drive
            if (recordData.namaPemrakarsa) {
                formData.append('namaPemrakarsa', recordData.namaPemrakarsa);
            }

            // Khusus Arsip: Format ulang checklist jadi string
            if (endpoint === 'arsip_perizinan' || endpoint === 'arsip') {
                const checkedItemsString = Object.keys(payload.checklistArsip).filter(key => payload.checklistArsip[key]).join(', ');
                formData.append('checklistArsip', checkedItemsString);
                formData.append('nomorIzinTerbit', payload.nomorIzinTerbit || '');
            } else {
                // Loop payload object dan masukkan ke FormData
                Object.keys(payload).forEach(key => {
                    formData.append(key, payload[key]);
                });
            }

            const res = await fetch(`/api/submit/${endpoint}`, {
                method: 'POST',
                // Jangan set 'Content-Type': 'application/json', biarkan browser set boundary multipart/form-data
                body: formData 
            });
            const responseData = await res.json();

            if (responseData.success) {
                showModal("Sukses", responseData.message || "Data berhasil disimpan.");
                fetchRecord(nomorChecklist); // Refresh data
                if (callback) callback();
            } else {
                showModal("Gagal", responseData.message || "Gagal menyimpan data.");
            }
        } catch (err) {
            showModal("Terjadi Kesalahan", "Gagal terhubung ke server.");
        }
    };

    // --- UI HELPERS ---
    const handleTabClick = (tabName: string) => {
        if ((tabName === 'E' || tabName === 'G') && recordData) {
            if (!recordData.fileTahapC && !recordData.fileTahapD) {
                showModal("Tahap Belum Terbuka", "Upload BA Verifikasi (C) atau BA Pemeriksaan (D) dulu.");
                return;
            }
        }
        setActiveTab(tabName);
    };

    const inputClass = "w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none";
    const btnClass = "mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition shadow-md hover:shadow-lg active:scale-95";
    
    // --- RENDER CONTENT ---
    const renderFormContent = () => {
        if (!recordData) return null;
        const { noUrut, namaKegiatan } = recordData;

        // TAHAP B
        if (activeTab === 'B') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('b', tahapBData); }}>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Penerbitan Uji Administrasi</label>
                        <input type="date" className={inputClass} value={tahapBData.tanggalPenerbitanUa} onChange={(e) => setTahapBData({ tanggalPenerbitanUa: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Status Tahap B</button>
                </form>
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload BA HUA</h3>
                    <FileUpload noUrut={noUrut} fileType="BA HUA" dbField="fileTahapB" currentFileUrl={recordData.fileTahapB} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa} />
                </div>
            </div>
        );

        // TAHAP C
        if (activeTab === 'C') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('c', tahapCData); }}>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Verifikasi Lapangan</label>
                        <input type="date" className={inputClass} value={tahapCData.tanggalVerifikasi} onChange={(e) => setTahapCData({ tanggalVerifikasi: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Status Tahap C</button>
                </form>
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload BA Verlap</h3>
                    <FileUpload noUrut={noUrut} fileType="BA Verlap" dbField="fileTahapC" currentFileUrl={recordData.fileTahapC} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa} />
                </div>
            </div>
        );

        // TAHAP D
        if (activeTab === 'D') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('d', tahapDData); }}>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Pemeriksaan Berkas</label>
                        <input type="date" className={inputClass} value={tahapDData.tanggalPemeriksaan} onChange={(e) => setTahapDData({ tanggalPemeriksaan: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Status Tahap D</button>
                </form>
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload BA Pemeriksaan</h3>
                    <FileUpload noUrut={noUrut} fileType="BA Pemeriksaan" dbField="fileTahapD" currentFileUrl={recordData.fileTahapD} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa}/>
                </div>
            </div>
        );

        // TAHAP E
        if (activeTab === 'E') {
            const dbField = `fileRevisi${tahapEData.nomorRevisi}`; // Sesuaikan dengan struktur DB baru
            const currentUrl = recordData[dbField];
            return (
                <div className="animate-in fade-in duration-300">
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('e', tahapEData); }}>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Revisi Ke-</label>
                                <select className={inputClass} value={tahapEData.nomorRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, nomorRevisi: e.target.value }))}>
                                    {[1,2,3,4,5].map(num => <option key={num} value={num}>Revisi {num}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Pemeriksaan Revisi</label>
                                <input type="date" className={inputClass} value={tahapEData.tanggalRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, tanggalRevisi: e.target.value }))} required />
                            </div>
                        </div>
                        <button type="submit" className={btnClass}>Simpan Status Revisi</button>
                    </form>
                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload BA Revisi {tahapEData.nomorRevisi}</h3>
                        <FileUpload noUrut={noUrut} fileType={`BA Revisi ${tahapEData.nomorRevisi}`} dbField={dbField} currentFileUrl={currentUrl} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa} />
                    </div>
                </div>
            );
        }

        // TAHAP G
        if (activeTab === 'G') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('g', tahapGData); }}>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Pembuatan Risalah</label>
                        <input type="date" className={inputClass} value={tahapGData.tanggalPembuatanRisalah} onChange={(e) => setTahapGData({ tanggalPembuatanRisalah: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Status Tahap G</button>
                </form>
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload Risalah Pengolahan Data (RPD)</h3>
                    <FileUpload noUrut={noUrut} fileType="RPD" dbField="fileTahapG" currentFileUrl={recordData.fileTahapG} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa}/>
                </div>
            </div>
        );

        // ARSIP
        if (activeTab === 'Arsip') {
             const arsipChecklistItems = [ "Surat Permohonan", "BA Checklist Pelayanan", "BA Hasil Uji Administrasi", "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data", "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Perbaikan", "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan" ];
             return (
                 <div className="animate-in fade-in duration-300">
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('arsip', arsipData); }}>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Izin Terbit (SPPL/PKPLH/SKKL)</label>
                                <input type="text" className={inputClass} value={arsipData.nomorIzinTerbit} onChange={(e) => setArsipData(p => ({...p, nomorIzinTerbit: e.target.value}))} />
                            </div>
                            <div className="bg-white border rounded p-4">
                                <h5 className="font-bold mb-3 border-b pb-2 text-gray-700">Checklist Kelengkapan Arsip Fisik</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {arsipChecklistItems.map((item) => (
                                        <label key={item} className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={arsipData.checklistArsip[item] || false} 
                                                onChange={(e) => setArsipData(p => ({...p, checklistArsip: {...p.checklistArsip, [item]: e.target.checked}}))}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className={btnClass}>Simpan Status Arsip</button>
                    </form>
                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload File Izin Terbit (Scan Final)</h3>
                        <FileUpload noUrut={noUrut} fileType="Izin Terbit (Final)" dbField="filePKPLH" currentFileUrl={recordData.filePKPLH} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa} />
                    </div>
                 </div>
             )
        }
        
        // PENGEMBALIAN
        if (activeTab === 'Pengembalian') return (
            <div className="animate-in fade-in duration-300">
                 <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('pengembalian', pengembalianData); }}>
                    <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                        <p className="text-red-700 text-sm mb-4 font-medium">⚠️ Gunakan form ini jika dokumen dikembalikan ke pemrakarsa karena ditolak/tidak lengkap.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Pengembalian</label>
                                <input type="date" className={inputClass} value={pengembalianData.tanggalPengembalian} onChange={(e) => setPengembalianData(p => ({ ...p, tanggalPengembalian: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alasan / Keterangan (Opsional)</label>
                                <input type="text" className={inputClass} placeholder="Alasan dikembalikan..." value={pengembalianData.keteranganPengembalian} onChange={(e) => setPengembalianData(p => ({ ...p, keteranganPengembalian: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition shadow-md">Simpan Status Pengembalian</button>
                </form>
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> Upload Tanda Terima Pengembalian</h3>
                    <FileUpload noUrut={noUrut} fileType="Bukti Pengembalian" dbField="filePengembalian" currentFileUrl={recordData.filePengembalian} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} namaPemrakarsa={recordData.namaPemrakarsa} />
                </div>
            </div>
        )

        return null;
    };

    // --- RENDER MAIN ---
    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-2xl mt-10 mb-10 font-sans">
            <h1 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4 flex items-center gap-3 tracking-tight">
                Update Proses Dokumen Lingkungan
            </h1>

            {/* SEARCH BOX */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8">
                <label className="block text-sm font-black uppercase tracking-widest text-indigo-800 mb-2">Cari Nomor Registrasi / Checklist</label>
                <input 
                    type="text" 
                    className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 text-lg font-mono focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all" 
                    placeholder="Contoh: REG-2026/001" 
                    value={nomorChecklist} 
                    onChange={(e) => setNomorChecklist(e.target.value)}
                />
                {loading && <p className="text-indigo-600 text-xs font-bold mt-2 animate-pulse uppercase tracking-widest">Sedang mencari data di server...</p>}
                {error && <p className="text-red-500 text-sm mt-2 font-bold">{error}</p>}
            </div>

            {recordData && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {/* TABS NAVIGATION */}
                    <div className="flex flex-wrap gap-2 border-b-2 border-gray-100 pb-0 mb-6">
                        {['B', 'C', 'D', 'E', 'G', 'Arsip', 'Pengembalian'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`px-6 py-3 rounded-t-xl font-black text-xs uppercase tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? 'bg-blue-600 text-white border-t-4 border-blue-800 shadow-inner' 
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                            >
                                {tab === 'E' ? 'Revisi (E)' : tab === 'G' ? 'Risalah (G)' : tab}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="min-h-[300px] mb-10">
                        {renderFormContent()}
                    </div>

                    {/* DETAIL TABLE (Read-only Summary) */}
                    <div className="pt-8 border-t-2 border-gray-100">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-200 pb-2">
                                Ringkasan Data Database (No. Urut: <span className="text-indigo-600">{recordData.noUrut}</span>)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                                    <tbody>
                                        <DetailRow label="Nama Pemrakarsa" value={`${recordData.namaPemrakarsa || '-'} (${recordData.teleponPemrakarsa || '-'})`} />
                                        <DetailRow label="Nama Kegiatan" value={recordData.namaKegiatan} />
                                        <DetailRow label="Jenis Dokumen" value={recordData.jenisDokumen} />
                                        
                                        {/* Status Penomoran dan File Drive */}
                                        {recordData.nomorUjiBerkas && <DetailRow label="BA Uji Administrasi" value={recordData.nomorUjiBerkas} driveLink={recordData.fileTahapB} highlight />}
                                        {recordData.nomorBAVerlap && <DetailRow label="BA Verifikasi Lapangan" value={recordData.nomorBAVerlap} driveLink={recordData.fileTahapC} highlight />}
                                        {recordData.nomorBAPemeriksaan && <DetailRow label="BA Pemeriksaan" value={recordData.nomorBAPemeriksaan} driveLink={recordData.fileTahapD} highlight />}
                                        {recordData.nomorRisalah && <DetailRow label="Risalah (RPD)" value={recordData.nomorRisalah} driveLink={recordData.fileTahapG} highlight />}
                                        {recordData.nomorIzinTerbit && <DetailRow label="Izin Terbit Final" value={recordData.nomorIzinTerbit} driveLink={recordData.filePKPLH} highlight />}
                                        {recordData.tanggalPengembalian && <DetailRow label="Status Dikembalikan" value={recordData.tanggalPengembalian} driveLink={recordData.filePengembalian} isDanger />}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <div className="p-4 text-center">
                    <p className="font-medium text-gray-700">{modalInfo.message}</p>
                    <button onClick={closeModal} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Tutup</button>
                </div>
            </Modal>
        </div>
    );
}

// Helper Components
const DetailRow = ({ label, value, highlight = false, isDanger = false, driveLink }: { label: string, value: string, highlight?: boolean, isDanger?: boolean, driveLink?: string }) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <th className="px-5 py-3 text-left w-1/3 bg-slate-50/50 font-bold text-xs uppercase tracking-wider text-slate-500 border-r">{label}</th>
        <td className={`px-5 py-3 text-sm flex items-center justify-between ${highlight ? 'text-indigo-700 font-bold' : isDanger ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'}`}>
            <span>{value || '-'}</span>
            {driveLink && (
                <a href={driveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors" title="Buka File di Drive">
                    <ExternalLink size={12} /> Drive
                </a>
            )}
        </td>
    </tr>
);