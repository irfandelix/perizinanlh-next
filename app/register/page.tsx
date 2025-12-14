"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, Phone, FileText, Printer, Save, Download } from 'lucide-react';

// --- IMPORT LIBRARY PDF CLIENT-SIDE ---
import { PDFDownloadLink } from '@react-pdf/renderer';

// --- IMPORT TEMPLATE PDF YANG SUDAH DIPERBAIKI ---
import { TandaTerimaPDF } from '@/components/pdf/TandaTerimaPDF'; 
import { ChecklistPrintTemplate } from '@/components/pdf/ChecklistPrintTemplate'; 

export default function RegisterDokumenPage() {
    // --- STATE 1: DATA FORMULIR ---
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

        // TAMBAHAN PENTING (Agar tidak error TypeScript)
        // Ini untuk menampung data balikan dari database
        nomorChecklist: '', 
        noUrut: ''
    });
    

    // --- STATE 2: CHECKLIST ---
    const [checklistStatus, setChecklistStatus] = useState<Record<number, boolean>>({});
    const [checklistNotes, setChecklistNotes] = useState<Record<number, string>>({});

    // --- STATE 3: STATUS AKHIR ---
    const [statusVerifikasi, setStatusVerifikasi] = useState("Diterima");
    
    // --- HYDRATION FIX (Wajib untuk Next.js App Router) ---
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const router = useRouter();

    // --- DATA ITEMS CHECKLIST ---
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

    // --- HANDLER SIMPAN KE DB (FINAL) ---
    const handleSimpan = async () => {
        // 1. Validasi Input
        if (!formData.nomorSuratPermohonan) {
            alert("Mohon isi Nomor Surat Permohonan!");
            return;
        }

        try {
            // 2. Siapkan Data
            const payload = {
                ...formData,       
                checklistStatus,   
                checklistNotes,    
                statusVerifikasi   
            };

            // 3. Kirim ke API
            const response = await fetch('/api/submit/tahap-a', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal menyimpan data ke server.");
            }

            // 4. UPDATE STATE (PENTING!)
            // Agar nomor registrasi langsung muncul di PDF tanpa perlu refresh halaman
            if (result.generatedData && result.generatedData.nomorChecklist) {
                setFormData(prev => ({ 
                    ...prev, 
                    // Kita update key 'nomorChecklist' agar terbaca oleh komponen PDF
                    nomorChecklist: result.generatedData.nomorChecklist 
                }));
            }

            // 5. Beri Notifikasi Sukses
            alert(`✅ BERHASIL DISIMPAN!\n\nNomor Registrasi: ${result.generatedData.nomorChecklist}\nNo Urut: ${result.generatedData.noUrut}`);
            
            // Opsi: Redirect dashboard (jika mau)
            // router.push('/dashboard'); 

        } catch (error: any) {
            console.error("Error saving:", error);
            alert("❌ TERJADI KESALAHAN:\n" + error.message);
        }
    };

    // Styling Variables
    const labelClass = "block mb-2 text-sm font-medium text-slate-700";
    const inputClass = "bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 shadow-sm";

    return (
        <div className="bg-slate-100 min-h-screen p-4 md:p-8 font-sans">
            
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText className="text-green-600" />
                    Registrasi Dokumen Masuk
                </h1>

                {/* --- BAGIAN 1: DATA REGISTRASI --- */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-green-800 font-bold text-lg mb-6 flex items-center border-b border-slate-200 pb-2">
                        <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                        Data Registrasi & Kelengkapan Dokumen
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Nomor Surat Permohonan</label>
                            <input name="nomorSuratPermohonan" className={inputClass} onChange={handleInputChange} placeholder="Nomor surat..." />
                        </div>
                        <div>
                            <label className={labelClass}>Tanggal Surat Permohonan</label>
                            <input name="tanggalSuratPermohonan" type="date" className={inputClass} onChange={handleInputChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Perihal Surat</label>
                            <input name="perihalSuratPermohonan" className={inputClass} onChange={handleInputChange} placeholder="Perihal surat..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nama Kegiatan</label>
                            <input name="namaKegiatan" className={inputClass} onChange={handleInputChange} placeholder="Contoh: Pembangunan Perumahan..." />
                        </div>
                        <div>
                            <label className={labelClass}>Lokasi Kegiatan</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input name="lokasiKegiatan" className={`${inputClass} pl-10`} onChange={handleInputChange} placeholder="Alamat lokasi..." />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Jenis Kegiatan</label>
                            <select name="jenisKegiatan" className={inputClass} onChange={handleInputChange} defaultValue="Perumahan">
                                <option value="Perumahan">Perumahan</option>
                                <option value="Industri">Industri</option>
                                <option value="Perdagangan">Perdagangan</option>
                                <option value="Kesehatan">Fasilitas Kesehatan</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
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
                            <label className={labelClass}>Tanggal Masuk Dokumen</label>
                            <input name="tanggalMasukDokumen" type="date" className={inputClass} onChange={handleInputChange} value={formData.tanggalMasukDokumen} />
                        </div>
                        
                        <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                            <p className="text-sm font-semibold text-slate-500 mb-3">Data Kontak</p>
                        </div>
                        
                        <div>
                            <label className={labelClass}>Nama Pemrakarsa</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input name="namaPemrakarsa" className={`${inputClass} pl-10`} onChange={handleInputChange} placeholder="Nama pemrakarsa..." />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>No. Telp Pemrakarsa</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input name="teleponPemrakarsa" className={`${inputClass} pl-10`} onChange={handleInputChange} placeholder="+62..." />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Nama Konsultan (Opsional)</label>
                            <input name="namaKonsultan" className={inputClass} onChange={handleInputChange} placeholder="Nama konsultan..." />
                        </div>
                        <div>
                            <label className={labelClass}>No. Telp Konsultan</label>
                            <input name="teleponKonsultan" className={inputClass} onChange={handleInputChange} placeholder="+62..." />
                        </div>
                        
                        <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                            <p className="text-sm font-semibold text-slate-500 mb-3">Data Pengiriman</p>
                        </div>
                        
                        <div>
                            <label className={labelClass}>Nama Pengirim</label>
                            <input name="namaPengirim" className={inputClass} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label className={labelClass}>Pengirim Sebagai</label>
                            <select name="pengirimSebagai" className={inputClass} onChange={handleInputChange} defaultValue="Pemrakarsa">
                                <option value="Pemrakarsa">Pemrakarsa</option>
                                <option value="Konsultan">Konsultan</option>
                                <option value="Kuasa">Kuasa Hukum</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Nama Petugas (Penerima)</label>
                            <input name="namaPetugas" className={inputClass} onChange={handleInputChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Keterangan (Opsional)</label>
                            <textarea name="keterangan" className={inputClass} rows={2} onChange={handleInputChange} placeholder="Catatan tambahan..."></textarea>
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN 2: CHECKLIST KELENGKAPAN --- */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 mt-8 shadow-sm">
                    <h3 className="text-green-800 font-bold text-lg mb-6 flex items-center border-b border-slate-200 pb-4">
                        <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm">2</span>
                        Checklist Kelengkapan Administrasi
                    </h3>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-12 text-center">No</th>
                                    <th scope="col" className="px-4 py-3">Persyaratan Dokumen</th>
                                    <th scope="col" className="px-4 py-3 w-32">Status</th>
                                    <th scope="col" className="px-4 py-3 w-1/3">Keterangan / Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checklistItems.map((item, index) => {
                                    const isRequired = item.label.includes('*');
                                    const labelText = item.label.replace('*', '');
                                    const isChecked = checklistStatus[index] || false;

                                    return (
                                        <tr key={item.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-center font-medium text-slate-900">{item.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {labelText}
                                                {isRequired && <span className="text-red-500 font-bold ml-1">*</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center cursor-pointer">
                                                    <input 
                                                        id={`chk-${index}`} 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={(e) => handleChecklistChange(index, e.target.checked)}
                                                        className="w-5 h-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer transition"
                                                    />
                                                    <label htmlFor={`chk-${index}`} className={`ml-2 text-xs font-bold uppercase cursor-pointer select-none ${isChecked ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {isChecked ? 'ADA' : 'BELUM'}
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg block w-full p-2" 
                                                    placeholder="Tidak ada berkas..."
                                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- BAGIAN 3: KESIMPULAN / STATUS AKHIR --- */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6 shadow-sm">
                    <h3 className="text-slate-800 font-bold text-lg mb-4 flex items-center border-b border-slate-200 pb-2">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                        Kesimpulan / Status Akhir Berkas
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block mb-2 text-sm font-bold text-slate-700">Status Kelengkapan Berkas</label>
                            <select 
                                value={statusVerifikasi}
                                onChange={(e) => setStatusVerifikasi(e.target.value)}
                                className={`block w-full p-3 text-sm rounded-lg border focus:ring-2 focus:outline-none font-bold transition-colors ${
                                    statusVerifikasi === 'Diterima' ? 'bg-green-50 border-green-300 text-green-800 focus:ring-green-500' :
                                    statusVerifikasi.includes('Catatan') ? 'bg-yellow-50 border-yellow-300 text-yellow-800 focus:ring-yellow-500' :
                                    'bg-red-50 border-red-300 text-red-800 focus:ring-red-500'
                                }`}
                            >
                                <option value="Diterima">LENGKAP / DITERIMA</option>
                                <option value="Diterima dengan Catatan">DITERIMA DENGAN CATATAN (Melengkapi Dahulu)</option>
                                <option value="Ditolak">DITOLAK / DIKEMBALIKAN</option>
                            </select>
                            <p className="mt-2 text-xs text-slate-500">*Pilih status akhir. Status ini akan tercetak pada Tanda Terima PDF.</p>
                        </div>
                    </div>
                </div>

                {/* --- TOMBOL AKSI (SIMPAN & DOWNLOAD) --- */}
                <div className="mt-8 mb-12 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    
                    {/* 1. TOMBOL SIMPAN */}
                    <button 
                        onClick={handleSimpan} 
                        className="bg-blue-600 flex-1 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 text-lg"
                    >
                        <Save className="w-5 h-5" />
                        Simpan Data
                    </button>

                    {/* 2. TOMBOL DOWNLOAD TANDA TERIMA */}
                    {isClient && (
                        <div className="flex-1">
                            <PDFDownloadLink 
                                document={<TandaTerimaPDF data={formData} />} 
                                fileName={`TandaTerima_${formData.nomorSuratPermohonan || 'Draft'}.pdf`}
                                className="w-full"
                            >
                                {({ blob, url, loading, error }) => (
                                    <button 
                                        disabled={loading}
                                        className={`w-full py-4 rounded-xl font-bold transition shadow-lg flex justify-center items-center gap-2 text-lg ${
                                            loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        <Download className="w-5 h-5" />
                                        {loading ? 'Menyiapkan PDF...' : 'Unduh Tanda Terima'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    )}

                    {/* 3. TOMBOL DOWNLOAD CHECKLIST */}
                    {isClient && (
                        <div className="flex-1">
                            <PDFDownloadLink 
                                document={
                                    <ChecklistPrintTemplate 
                                        data={formData} 
                                        checklistStatus={checklistStatus}
                                        statusVerifikasi={statusVerifikasi}
                                    />
                                } 
                                fileName={`Checklist_${formData.nomorChecklist || formData.nomorSuratPermohonan || 'Draft'}.pdf`}
                                className="w-full"
                            >
                                {({ blob, url, loading, error }) => (
                                    <button 
                                        disabled={loading}
                                        className={`w-full py-4 rounded-xl font-bold transition shadow-lg flex justify-center items-center gap-2 text-lg ${
                                            loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                        }`}
                                    >
                                        <FileText className="w-5 h-5" />
                                        {loading ? 'Menyiapkan PDF...' : 'Unduh Checklist'}
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