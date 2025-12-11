"use client";

import React, { useState } from 'react';
import { MapPin, User, Phone, FileText, Printer, Save } from 'lucide-react';

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
        tanggalMasukDokumen: new Date().toISOString().split('T')[0], // Default hari ini
        namaPemrakarsa: '',
        teleponPemrakarsa: '',
        namaKonsultan: '',
        teleponKonsultan: '',
        namaPengirim: '',
        pengirimSebagai: 'Pemrakarsa',
        namaPetugas: '',
        keterangan: ''
    });

    // --- STATE 2: CHECKLIST ---
    const [checklistStatus, setChecklistStatus] = useState<Record<number, boolean>>({});
    const [checklistNotes, setChecklistNotes] = useState<Record<number, string>>({});

    // --- STATE 3: STATUS AKHIR (KESIMPULAN) ---
    const [statusVerifikasi, setStatusVerifikasi] = useState("Diterima");

    // --- DATA ITEMS CHECKLIST (18 ITEM) ---
    // Bintang (*) hanya pada nomor 1, 2, dan 3 sesuai request
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

    const handleSimpanDanCetak = () => {
        // Di sini bisa ditambahkan logika simpan ke database (API Call)
        console.log("Menyimpan Data...", { formData, checklistStatus, statusVerifikasi });
        
        // Trigger Print
        window.print();
    };

    // Styling Variables
    const labelClass = "block mb-2 text-sm font-medium text-slate-700";
    const inputClass = "bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 shadow-sm";

    return (
        <div className="bg-slate-100 min-h-screen p-4 md:p-8 font-sans">
            
            {/* ================================================================= */}
            {/* TAMPILAN LAYAR (INPUT FORM) - Hidden Saat Print                   */}
            {/* ================================================================= */}
            <div className="max-w-5xl mx-auto print:hidden">
                
                <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText className="text-green-600" />
                    Registrasi Dokumen Masuk
                </h1>

                {/* --- BAGIAN 1: DATA REGISTRASI LENGKAP --- */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-green-800 font-bold text-lg mb-6 flex items-center border-b border-slate-200 pb-2">
                        <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                        Data Registrasi & Kelengkapan Dokumen
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Data Surat */}
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

                        {/* Data Kegiatan */}
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
                            <select name="jenisDokumen" className={inputClass} onChange={handleInputChange} defaultValue="UKLUPL">
                                <option value="UKLUPL">UKL-UPL</option>
                                <option value="AMDAL">AMDAL</option>
                                <option value="SPPL">SPPL</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Tanggal Masuk Dokumen</label>
                            <input name="tanggalMasukDokumen" type="date" className={inputClass} onChange={handleInputChange} value={formData.tanggalMasukDokumen} />
                        </div>

                        {/* Data Kontak */}
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

                        {/* Data Pengiriman */}
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
                                    // Logika: Tanda bintang (*) hanya di item 1, 2, 3
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

                {/* --- BAGIAN 3: KESIMPULAN / STATUS AKHIR (PERMINTAAN TERBARU) --- */}
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
                            <p className="mt-2 text-xs text-slate-500">
                                *Pilih status akhir. Status ini akan tercetak pada Tanda Terima.
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="hidden md:block p-4 rounded-lg border border-slate-200 bg-white">
                            <p className="text-xs text-slate-400 uppercase mb-1">Preview pada Cetakan:</p>
                            <div className="border border-black p-2 text-center">
                                <span className="font-bold text-xs mr-2">Status Kelengkapan Berkas*:</span>
                                <span className="border border-black px-3 py-0.5 font-bold text-xs bg-white inline-block">
                                    {statusVerifikasi}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tombol Simpan & Cetak */}
                <div className="mt-8 mb-12">
                    <button 
                        onClick={handleSimpanDanCetak} 
                        className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 text-lg"
                    >
                        <Save className="w-5 h-5" />
                        Simpan & Cetak Tanda Terima
                    </button>
                </div>
            </div>

            {/* ================================================================= */}
            {/* TAMPILAN CETAK (PRINT ONLY) - Tanda Terima                        */}
            {/* ================================================================= */}
            <div className="hidden print:block font-serif text-black bg-white w-full h-auto p-8">
                
                {/* 1. KOP SURAT */}
                <div className="border-b-4 border-double border-black pb-4 mb-6 text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wide">Pemerintah Kabupaten Sragen</h4>
                    <h2 className="font-bold text-2xl uppercase tracking-wider">Dinas Lingkungan Hidup</h2>
                    <p className="text-sm">Jl. Raya Sukowati No. 20, Sragen, Jawa Tengah</p>
                </div>

                {/* 2. JUDUL */}
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold underline uppercase">TANDA TERIMA DOKUMEN</h1>
                    <p className="text-sm mt-1">Nomor Registrasi: ________ / DLH / {new Date().getFullYear()}</p>
                </div>

                {/* 3. ISI UTAMA */}
                <div className="text-sm leading-loose mb-6">
                    <p>Telah diterima berkas dokumen permohonan persetujuan lingkungan pada tanggal <b>{formData.tanggalMasukDokumen}</b> dengan rincian:</p>
                    <table className="w-full mt-4 align-top">
                        <tbody>
                            <tr><td className="w-48 py-1">1. Nama Pemrakarsa</td><td className="py-1">: <b>{formData.namaPemrakarsa || "................................................"}</b></td></tr>
                            <tr><td className="py-1">2. Judul Kegiatan</td><td className="py-1">: {formData.namaKegiatan || "................................................"}</td></tr>
                            <tr><td className="py-1">3. Lokasi Kegiatan</td><td className="py-1">: {formData.lokasiKegiatan || "................................................"}</td></tr>
                            <tr><td className="py-1">4. No. Surat Permohonan</td><td className="py-1">: {formData.nomorSuratPermohonan || "................................................"}</td></tr>
                            <tr><td className="py-1">5. Jenis Dokumen</td><td className="py-1">: {formData.jenisDokumen}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* 4. STATUS AKHIR (HASIL DARI BAGIAN 3) */}
                <div className="border-2 border-black p-4 mb-8 text-center">
                    <p className="font-bold mb-2 uppercase text-xs tracking-wider">Status Kelengkapan Berkas</p>
                    <div className="inline-block border-b-2 border-black pb-1 text-lg font-bold">
                        {statusVerifikasi.toUpperCase()}
                    </div>
                    {statusVerifikasi !== 'Diterima' && (
                        <p className="text-xs italic mt-2">Catatan: Silakan lengkapi kekurangan berkas sesuai checklist terlampir.</p>
                    )}
                </div>

                {/* 5. TANDA TANGAN */}
                <div className="flex justify-between px-4 mt-12">
                    <div className="text-center w-64">
                        <p className="mb-20">Yang Menyerahkan,</p>
                        <p className="font-bold border-b border-black">{formData.namaPengirim || "(....................................)"}</p>
                        <p className="text-xs text-left mt-1">{formData.pengirimSebagai}</p>
                    </div>
                    <div className="text-center w-64">
                        <p className="mb-20">Petugas Penerima,</p>
                        <p className="font-bold border-b border-black">{formData.namaPetugas || "(....................................)"}</p>
                        <p className="text-xs text-left mt-1">NIP. ....................................</p>
                    </div>
                </div>

                <div className="fixed bottom-4 left-0 w-full text-center text-[10px] text-slate-400 italic">
                    Dicetak melalui Sistem Informasi Lingkungan Hidup pada {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
}