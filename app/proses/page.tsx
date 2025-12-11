'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import Modal from '@/components/Modal';

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
    const [pengembalianData, setPengembalianData] = useState({ tanggalPengembalian: '' });

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
            // Kita belum buat API 'find' di backend Next.js sebelumnya, 
            // nanti kita buat file route-nya. Ini asumsi sudah ada.
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
                // Jangan error merah jika data belum ketemu saat mengetik, cukup null
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
            setPengembalianData({ tanggalPengembalian: recordData.tanggalPengembalian || '' });
            
            const savedChecks = recordData.checklistArsip ? recordData.checklistArsip.split(',').map((item: string) => item.trim()) : [];
            const checkState: any = {};
            savedChecks.forEach((item: string) => { if(item) checkState[item] = true; });
            setArsipData({
                nomorIzinTerbit: recordData.nomorIzinTerbit || '',
                checklistArsip: checkState
            });
        }
    }, [recordData]);

    // --- HANDLE SUBMIT ---
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

        let finalPayload = { ...payload };
        // Khusus Arsip: Format ulang checklist jadi string
        if (endpoint === 'arsip_perizinan') {
            const checkedItemsString = Object.keys(payload.checklistArsip).filter(key => payload.checklistArsip[key]).join(', ');
            finalPayload = { checklistArsip: checkedItemsString, nomorIzinTerbit: payload.nomorIzinTerbit };
        }

        try {
            const res = await fetch(`/api/submit/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noUrut: recordData.noUrut, ...finalPayload })
            });
            const responseData = await res.json();

            if (responseData.success) {
                showModal("Sukses", responseData.message);
                fetchRecord(nomorChecklist); // Refresh data
                if (callback) callback();
            } else {
                showModal("Gagal", responseData.message);
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
    const btnClass = "mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition";
    
    // --- RENDER CONTENT ---
    const renderFormContent = () => {
        if (!recordData) return null;
        const { noUrut, namaKegiatan } = recordData;

        // TAHAP B
        if (activeTab === 'B') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('b', tahapBData); }}>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-semibold mb-2">Tanggal Penerbitan Uji Administrasi</label>
                        <input type="date" className={inputClass} value={tahapBData.tanggalPenerbitanUa} onChange={(e) => setTahapBData({ tanggalPenerbitanUa: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Tahap B</button>
                </form>
                <FileUpload noUrut={noUrut} fileType="BA HUA" dbField="fileTahapB" currentFileUrl={recordData.fileTahapB} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
            </div>
        );

        // TAHAP C
        if (activeTab === 'C') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('c', tahapCData); }}>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-semibold mb-2">Tanggal Verifikasi Lapangan</label>
                        <input type="date" className={inputClass} value={tahapCData.tanggalVerifikasi} onChange={(e) => setTahapCData({ tanggalVerifikasi: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Tahap C</button>
                </form>
                <FileUpload noUrut={noUrut} fileType="BA Verlap" dbField="fileTahapC" currentFileUrl={recordData.fileTahapC} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
            </div>
        );

        // TAHAP D
        if (activeTab === 'D') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('d', tahapDData); }}>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-semibold mb-2">Tanggal Pemeriksaan Berkas</label>
                        <input type="date" className={inputClass} value={tahapDData.tanggalPemeriksaan} onChange={(e) => setTahapDData({ tanggalPemeriksaan: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Tahap D</button>
                </form>
                <FileUpload noUrut={noUrut} fileType="BA Pemeriksaan" dbField="fileTahapD" currentFileUrl={recordData.fileTahapD} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
            </div>
        );

        // TAHAP E
        if (activeTab === 'E') {
            const dbField = `fileTahapE${tahapEData.nomorRevisi}`;
            const currentUrl = recordData[dbField];
            return (
                <div className="animate-in fade-in duration-300">
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('e', tahapEData); }}>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Pilih Revisi Ke-</label>
                                <select className={inputClass} value={tahapEData.nomorRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, nomorRevisi: e.target.value }))}>
                                    {[1,2,3,4,5].map(num => <option key={num} value={num}>Revisi {num}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Tanggal Pemeriksaan Revisi</label>
                                <input type="date" className={inputClass} value={tahapEData.tanggalRevisi} onChange={(e) => setTahapEData(prev => ({ ...prev, tanggalRevisi: e.target.value }))} required />
                            </div>
                        </div>
                        <button type="submit" className={btnClass}>Simpan Revisi</button>
                    </form>
                    <FileUpload noUrut={noUrut} fileType={`BA Revisi ${tahapEData.nomorRevisi}`} dbField={dbField} currentFileUrl={currentUrl} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                </div>
            );
        }

        // TAHAP G
        if (activeTab === 'G') return (
            <div className="animate-in fade-in duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('g', tahapGData); }}>
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-semibold mb-2">Tanggal Pembuatan Risalah</label>
                        <input type="date" className={inputClass} value={tahapGData.tanggalPembuatanRisalah} onChange={(e) => setTahapGData({ tanggalPembuatanRisalah: e.target.value })} required />
                    </div>
                    <button type="submit" className={btnClass}>Simpan Tahap G</button>
                </form>
                <FileUpload noUrut={noUrut} fileType="RPD" dbField="fileTahapG" currentFileUrl={recordData.fileTahapG} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
            </div>
        );

        // ARSIP
        if (activeTab === 'Arsip') {
             const arsipChecklistItems = [ "Surat Permohonan", "BA Checklist Pelayanan", "BA Hasil Uji Administrasi", "BA Verifikasi Lapangan", "Undangan", "BA Pemeriksaan Dokumen", "Risalah Pengolahan Data", "Surat Penyampaian Dokumen Hasil Perbaikan", "Tanda Terima Berkas Perbaikan", "BA Pemeriksaan Dokumen II/III/Dst.", "PKPLH / SPPL / SKKL", "Dokumen Lingkungan" ];
             return (
                 <div className="animate-in fade-in duration-300">
                    <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('arsip_perizinan', arsipData); }}>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Nomor Izin Terbit (SPPL/PKPLH/SKKL)</label>
                                <input type="text" className={inputClass} value={arsipData.nomorIzinTerbit} onChange={(e) => setArsipData(p => ({...p, nomorIzinTerbit: e.target.value}))} />
                            </div>
                            <div className="bg-white border rounded p-3">
                                <h5 className="font-bold mb-3 border-b pb-2">Checklist Kelengkapan Arsip</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {arsipChecklistItems.map((item) => (
                                        <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={arsipData.checklistArsip[item] || false} 
                                                onChange={(e) => setArsipData(p => ({...p, checklistArsip: {...p.checklistArsip, [item]: e.target.checked}}))}
                                            />
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className={btnClass}>Simpan Arsip</button>
                    </form>
                    <FileUpload noUrut={noUrut} fileType="Izin Terbit (Final)" dbField="filePKPLH" currentFileUrl={recordData.filePKPLH} onUploadSuccess={() => fetchRecord(nomorChecklist)} namaKegiatan={namaKegiatan} />
                 </div>
             )
        }
        
        // PENGEMBALIAN
        if (activeTab === 'Pengembalian') return (
            <div className="animate-in fade-in duration-300">
                 <form onSubmit={(e) => { e.preventDefault(); handleApiSubmit('pengembalian', pengembalianData); }}>
                    <div className="bg-red-50 p-4 rounded border border-red-200">
                        <p className="text-red-700 text-sm mb-4">Gunakan form ini jika dokumen dikembalikan ke pemrakarsa untuk perbaikan.</p>
                        <label className="block text-sm font-semibold mb-2">Tanggal Pengembalian</label>
                        <input type="date" className={inputClass} value={pengembalianData.tanggalPengembalian} onChange={(e) => setPengembalianData({ tanggalPengembalian: e.target.value })} required />
                    </div>
                    <button type="submit" className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition">Simpan Status Pengembalian</button>
                </form>
            </div>
        )

        return null;
    };

    // --- RENDER MAIN ---
    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10 mb-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                Update Proses Dokumen Lingkungan
            </h1>

            {/* SEARCH BOX */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cari Nomor Registrasi / Checklist</label>
                <input 
                    type="text" 
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 text-lg focus:border-blue-500 focus:outline-none" 
                    placeholder="Contoh: 660/123/DLH/2025" 
                    value={nomorChecklist} 
                    onChange={(e) => setNomorChecklist(e.target.value)}
                />
                {loading && <p className="text-blue-600 text-sm mt-2 animate-pulse">Sedang mencari data...</p>}
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            </div>

            {recordData && (
                <div>
                    {/* TABS NAVIGATION */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 mb-6">
                        {['B', 'C', 'D', 'E', 'G', 'Arsip', 'Pengembalian'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab === 'E' ? 'Tahap E (Revisi)' : tab === 'G' ? 'Tahap G (RPD)' : tab}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="min-h-[300px]">
                        {renderFormContent()}
                    </div>

                    {/* DETAIL TABLE */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                         <h3 className="text-lg font-bold text-gray-700 mb-4">Ringkasan Data (No. Urut: {recordData.noUrut})</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse border border-gray-200">
                                <tbody>
                                    <DetailRow label="Nomor Surat Permohonan" value={recordData.nomorSuratPermohonan} />
                                    <DetailRow label="Nama Kegiatan" value={recordData.namaKegiatan} />
                                    <DetailRow label="Jenis Dokumen" value={recordData.jenisDokumen} />
                                    <DetailRow label="Pemrakarsa" value={`${recordData.namaPemrakarsa} (${recordData.teleponPemrakarsa})`} />
                                    
                                    {/* Conditional Rows based on progress */}
                                    {recordData.nomorUjiBerkas && <DetailRow label="BA Uji Administrasi" value={recordData.nomorUjiBerkas} highlight />}
                                    {recordData.nomorBAVerlap && <DetailRow label="BA Verifikasi Lapangan" value={recordData.nomorBAVerlap} highlight />}
                                    {recordData.nomorBAPemeriksaan && <DetailRow label="BA Pemeriksaan" value={recordData.nomorBAPemeriksaan} highlight />}
                                    {recordData.nomorIzinTerbit && <DetailRow label="Izin Terbit (PKPLH/SPPL)" value={recordData.nomorIzinTerbit} highlight />}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <p>{modalInfo.message}</p>
            </Modal>
        </div>
    );
}

// Helper Components
const DetailRow = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
        <th className="px-4 py-3 text-left w-1/3 bg-gray-50 font-medium text-gray-600 border-r">{label}</th>
        <td className={`px-4 py-3 ${highlight ? 'text-blue-700 font-bold' : 'text-gray-800'}`}>{value || '-'}</td>
    </tr>
);