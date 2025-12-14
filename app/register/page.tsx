"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, Phone, FileText, Printer, Save, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Import Template
import { TandaTerimaPDF } from '@/components/pdf/TandaTerimaPDF'; 
import { ChecklistPrintTemplate } from '@/components/pdf/ChecklistPrintTemplate'; 

export default function RegisterDokumenPage() {
    // --- STATE ---
    const [formData, setFormData] = useState({
        nomorSuratPermohonan: '',
        tanggalSuratPermohonan: '',
        perihalSuratPermohonan: '',
        namaKegiatan: '',
        lokasiKegiatan: '',
        jenisKegiatan: 'Perumahan',
        jenisDokumen: 'UKL-UPL',
        tanggalMasukDokumen: new Date().toISOString().split('T')[0], 
        namaPemrakarsa: '',
        teleponPemrakarsa: '',
        namaKonsultan: '',
        teleponKonsultan: '',
        namaPengirim: '',
        pengirimSebagai: 'Pemrakarsa',
        namaPetugas: '',
        keterangan: '',
        // Field Data dari Database
        nomorChecklist: '', 
        noUrut: '' 
    });

    const [checklistStatus, setChecklistStatus] = useState<Record<number, boolean>>({});
    const [checklistNotes, setChecklistNotes] = useState<Record<number, string>>({});
    const [statusVerifikasi, setStatusVerifikasi] = useState("Diterima");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    // --- CHECKLIST ITEMS ---
    const checklistItems = [
        { id: 1, label: "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL*" },
        { id: 2, label: "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)*" },
        { id: 3, label: "Dokumen Lingkungan*" },
        { id: 4, label: "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan di Kertas A3" },
        { id: 5, label: "PKKPR" },
        { id: 6, label: "NIB (Untuk Swasta atau Perorangan)" },
        { id: 7, label: "Fotocopy Status Lahan (Sertifikat)" },
        { id: 8, label: "Fotocopy KTP Penanggungjawab Kegiatan" },
        { id: 9, label: "Foto Eksisting Lokasi Rencana Kegiatan Disertai dengan Titik Koordinat" },
        { id: 10, label: "Lembar Penapisan dari AMDALNET / Arahan dari Instansi Lingkungan Hidup" },
        { id: 11, label: "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)" },
        { id: 12, label: "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)" },
        { id: 13, label: "Pemenuhan Persetujuan Teknis Air Limbah" },
        { id: 14, label: "Pemenuhan Rincian Teknis Limbah B3 Sementara" },
        { id: 15, label: "Pemenuhan Persetujuan Teknis Emisi" },
        { id: 16, label: "Pemenuhan Persetujuan Teknis Andalalin" },
        { id: 17, label: "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis" },
        { id: 18, label: "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING" }
    ];

    // --- HANDLERS ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChecklistChange = (index: number, isChecked: boolean) => {
        setChecklistStatus(prev => ({ ...prev, [index]: isChecked }));
    };

    const handleNoteChange = (index: number, value: string) => {
        setChecklistNotes(prev => ({ ...prev, [index]: value }));
    };

    const handleSimpan = async () => {
        if (!formData.nomorSuratPermohonan) {
            alert("Mohon isi Nomor Surat Permohonan!");
            return;
        }

        try {
            const payload = { ...formData, checklistStatus, checklistNotes, statusVerifikasi };

            const response = await fetch('/api/submit/tahap-a', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || "Gagal menyimpan.");

            if (result.generatedData && result.generatedData.nomorChecklist) {
                setFormData(prev => ({ 
                    ...prev, 
                    nomorChecklist: result.generatedData.nomorChecklist,
                    noUrut: result.generatedData.noUrut
                }));
            }

            alert(`✅ BERHASIL DISIMPAN!\nNomor: ${result.generatedData.nomorChecklist}`);

        } catch (error: any) {
            console.error(error);
            alert("❌ TERJADI KESALAHAN:\n" + error.message);
        }
    };

    // --- HELPER NAMA FILE ---
    const getFileName = (prefix: string) => {
        // Jika belum ada nomor checklist (belum disimpan), pakai nama default
        if (!formData.nomorChecklist) return `${prefix}_draft.pdf`;

        try {
            // Format DB: 600.4/001.8/17/REG.UKLUPL/2025
            // Kita pecah berdasarkan garis miring '/'
            const parts = formData.nomorChecklist.split('/');
            
            // Ambil Nomor Urut (001) dari bagian kedua (001.8)
            const noUrut = parts[1] ? parts[1].split('.')[0] : '000';
            
            // Ambil Jenis Dokumen (REG.UKLUPL)
            const jenisDok = parts[3] || 'DOK';
            
            // Ambil Tahun (2025)
            const tahun = parts[4] || new Date().getFullYear();

            // Format Akhir: checklist_001_REG.UKLUPL_2025.pdf
            return `${prefix}_${noUrut}_${jenisDok}_${tahun}.pdf`;
        } catch (error) {
            return `${prefix}_${formData.nomorSuratPermohonan}.pdf`;
        }
    };

    const labelClass = "block mb-2 text-sm font-medium text-slate-700";
    const inputClass = "bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 shadow-sm";

    return (
        <div className="bg-slate-100 min-h-screen p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText className="text-green-600" /> Registrasi Dokumen Masuk
                </h1>

                {/* FORM INPUT SECTION */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                    <h3 className="text-green-800 font-bold text-lg mb-6 flex items-center border-b border-slate-200 pb-2">
                        <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span> Data Registrasi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ... (INPUT FIELD SAMA SEPERTI SEBELUMNYA) ... */}
                        {/* Saya ringkas agar fokus ke logic download */}
                        <div className="space-y-4">
                            <div><label className={labelClass}>Nomor Surat</label><input name="nomorSuratPermohonan" className={inputClass} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Tanggal Surat</label><input type="date" name="tanggalSuratPermohonan" className={inputClass} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Perihal</label><input name="perihalSuratPermohonan" className={inputClass} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Kegiatan</label><input name="namaKegiatan" className={inputClass} onChange={handleInputChange} /></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Jenis Dokumen</label>
                                <select name="jenisDokumen" className={inputClass} onChange={handleInputChange} value={formData.jenisDokumen}>
                                    <option value="UKL-UPL">UKL-UPL</option>
                                    <option value="AMDAL">AMDAL</option>
                                    <option value="SPPL">SPPL</option>
                                    <option value="RINTEK LB3">Rincian Teknis Limbah B3</option>
                                    <option value="PERTEK AIR LIMBAH">Persetujuan Teknis Air Limbah</option>
                                    <option value="PERTEK EMISI">Persetujuan Teknis Emisi</option>
                                    <option value="SLO">SLO</option>
                                    <option value="DPLH">DPLH</option>
                                    <option value="DELH">DELH</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Jenis Kegiatan</label>
                                <select name="jenisKegiatan" className={inputClass} onChange={handleInputChange}>
                                    <option value="Perumahan">Perumahan</option>
                                    <option value="Industri">Industri</option>
                                    <option value="Perdagangan">Perdagangan</option>
                                    <option value="Kesehatan">Fasilitas Kesehatan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>Lokasi</label><input name="lokasiKegiatan" className={inputClass} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Tanggal Masuk</label><input type="date" name="tanggalMasukDokumen" className={inputClass} onChange={handleInputChange} value={formData.tanggalMasukDokumen} /></div>
                        </div>
                        
                        {/* Kontak & Pengirim */}
                        <div className="md:col-span-2 border-t pt-4 mt-2"><p className="text-sm font-semibold text-slate-500">Kontak</p></div>
                        <div><label className={labelClass}>Pemrakarsa</label><input name="namaPemrakarsa" className={inputClass} onChange={handleInputChange} /></div>
                        <div><label className={labelClass}>Telp Pemrakarsa</label><input name="teleponPemrakarsa" className={inputClass} onChange={handleInputChange} /></div>
                        <div><label className={labelClass}>Konsultan</label><input name="namaKonsultan" className={inputClass} onChange={handleInputChange} /></div>
                        <div><label className={labelClass}>Telp Konsultan</label><input name="teleponKonsultan" className={inputClass} onChange={handleInputChange} /></div>
                        
                        <div><label className={labelClass}>Pengirim</label><input name="namaPengirim" className={inputClass} onChange={handleInputChange} /></div>
                        <div><label className={labelClass}>Status Pengirim</label>
                            <select name="pengirimSebagai" className={inputClass} onChange={handleInputChange}>
                                <option value="Pemrakarsa">Pemrakarsa</option>
                                <option value="Konsultan">Konsultan</option>
                                <option value="Kuasa">Kuasa Hukum</option>
                            </select>
                        </div>
                        <div><label className={labelClass}>Petugas Penerima</label><input name="namaPetugas" className={inputClass} onChange={handleInputChange} /></div>
                        <div><label className={labelClass}>Keterangan</label><input name="keterangan" className={inputClass} onChange={handleInputChange} /></div>
                    </div>
                </div>

                {/* CHECKLIST SECTION */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <h3 className="text-green-800 font-bold text-lg mb-6 flex items-center border-b border-slate-200 pb-2">
                        <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span> Checklist Kelengkapan
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="bg-slate-100 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center">No</th>
                                    <th className="px-4 py-3">Persyaratan</th>
                                    <th className="px-4 py-3 w-24 text-center">Ada</th>
                                    <th className="px-4 py-3 w-1/3">Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checklistItems.map((item, index) => (
                                    <tr key={item.id} className="border-b hover:bg-slate-50">
                                        <td className="px-4 py-2 text-center">{item.id}</td>
                                        <td className="px-4 py-2">{item.label}</td>
                                        <td className="px-4 py-2 text-center">
                                            <input type="checkbox" checked={checklistStatus[index] || false} onChange={(e) => handleChecklistChange(index, e.target.checked)} className="w-5 h-5 text-green-600 rounded cursor-pointer" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input type="text" className="bg-slate-50 border text-xs rounded w-full p-2" onChange={(e) => handleNoteChange(index, e.target.value)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STATUS & SUMMARY */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
                    <h3 className="text-slate-800 font-bold text-lg mb-4 flex items-center">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span> Kesimpulan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block mb-2 text-sm font-bold text-slate-700">Status Kelengkapan</label>
                            <select value={statusVerifikasi} onChange={(e) => setStatusVerifikasi(e.target.value)} className="block w-full p-3 text-sm rounded-lg border font-bold">
                                <option value="Diterima">LENGKAP / DITERIMA</option>
                                <option value="Diterima dengan Catatan">DITERIMA DENGAN CATATAN</option>
                                <option value="Ditolak">DITOLAK / DIKEMBALIKAN</option>
                            </select>
                        </div>
                        <div className="bg-white border p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500 uppercase">Nomor Registrasi Terbit</p>
                            <p className="text-lg font-bold text-blue-600">{formData.nomorChecklist || "- Belum Disimpan -"}</p>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mb-12 flex flex-col md:flex-row gap-4">
                    <button onClick={handleSimpan} className="bg-blue-600 flex-1 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex justify-center items-center gap-2">
                        <Save className="w-5 h-5" /> Simpan Data
                    </button>

                    {isClient && (
                        <div className="flex-1">
                            <PDFDownloadLink 
                                document={<TandaTerimaPDF data={formData} />} 
                                // Gunakan helper getFileName dengan prefix "tanda_terima"
                                fileName={getFileName('tanda_terima')}
                                className="w-full"
                            >
                                {({ loading }) => (
                                    <button disabled={loading || !formData.nomorChecklist} className={`w-full py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 text-white transition ${loading || !formData.nomorChecklist ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                        <Printer className="w-5 h-5" /> {loading ? 'Loading...' : 'Unduh Tanda Terima'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                            {!formData.nomorChecklist && <p className="text-xs text-center text-red-500 mt-1">*Simpan data dulu</p>}
                        </div>
                    )}

                    {isClient && (
                        <div className="flex-1">
                            <PDFDownloadLink 
                                document={<ChecklistPrintTemplate data={formData} checklistStatus={checklistStatus} statusVerifikasi={statusVerifikasi} />} 
                                // Gunakan helper getFileName dengan prefix "checklist"
                                // Hasil: checklist_001_REG.UKLUPL_2025.pdf
                                fileName={getFileName('checklist')}
                                className="w-full"
                            >
                                {({ loading }) => (
                                    <button disabled={loading} className="w-full py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 text-white bg-yellow-600 hover:bg-yellow-700">
                                        <Download className="w-5 h-5" /> Unduh Checklist
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}