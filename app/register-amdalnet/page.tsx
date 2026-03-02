'use client';

import React, { useState } from 'react';
import { Save, Globe, FileText, MapPin, User, Phone, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal'; 
import api from '@/lib/api'; 

export default function RegisterAmdalnet() {
    const [loading, setLoading] = useState(false);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', isSuccess: false });

    const [formData, setFormData] = useState({
        nomorRegistrasiAmdalnet: '', // Untuk nampung ID dari web amdalnet
        nomorSuratPermohonan: '', 
        tanggalSuratPermohonan: '', 
        perihalSuratPermohonan: '', 
        namaKegiatan: '',
        jenisKegiatan: '',
        lokasiKegiatan: '', 
        tanggalMasukDokumen: '',
        jenisDokumen: 'UKL-UPL', 
        besaranLuasan: '',
        satuanLuasan: 'm2', 
        namaPemrakarsa: '', 
        alamatPemrakarsa: '',
        teleponPemrakarsa: '',
        namaKonsultan: '', 
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...formData, sumberData: 'AMDALNET' };
            const response = await api.post('/api/submit/amdalnet', payload);
            
            setModalInfo({
                show: true,
                title: 'Registrasi Berhasil',
                message: `Dokumen berhasil diregistrasi! Nomor Checklist (DLH): ${response.data.nomorChecklist}`,
                isSuccess: true
            });

            setFormData({
                nomorRegistrasiAmdalnet: '', nomorSuratPermohonan: '', tanggalSuratPermohonan: '', perihalSuratPermohonan: '',
                namaKegiatan: '', jenisKegiatan: '', lokasiKegiatan: '', tanggalMasukDokumen: '', jenisDokumen: 'UKL-UPL', 
                besaranLuasan: '', satuanLuasan: 'm2', namaPemrakarsa: '', alamatPemrakarsa: '', teleponPemrakarsa: '', namaKonsultan: '',
            });

        } catch (error: any) {
            setModalInfo({ show: true, title: 'Gagal Menyimpan', message: error.response?.data?.message || 'Error server.', isSuccess: false });
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => setModalInfo({ ...modalInfo, show: false });

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-xl my-8 border border-gray-100">
            <div className="border-b-2 border-emerald-100 pb-4 mb-6 flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Globe size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Registrasi Dokumen AMDALNET</h1>
                    <p className="text-sm text-gray-500 font-medium">Pencatatan Manual Dokumen Lingkungan via Kantor DLH</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {/* 1. SEKSI DOKUMEN & AMDALNET */}
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        <FileText size={18} /> Data Dokumen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            {/* KEMBALI OTOMATIS */}
                            <label className="block text-sm font-semibold mb-1 text-gray-700">1. Nomor Checklist (Sistem DLH)</label>
                            <input type="text" className="w-full p-2.5 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed font-medium italic" value="Otomatis dibuat saat disimpan (Format: 600.4/...)" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">2. Nomor Registrasi Amdalnet <span className="text-red-500">*</span></label>
                            <input type="text" name="nomorRegistrasiAmdalnet" className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.nomorRegistrasiAmdalnet} onChange={handleChange} placeholder="Ketik nomor dokumen dari Amdalnet..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">3. Tanggal Masuk Dokumen <span className="text-red-500">*</span></label>
                            <input type="date" name="tanggalMasukDokumen" className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.tanggalMasukDokumen} onChange={handleChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">4. Jenis Dokumen <span className="text-red-500">*</span></label>
                            <select name="jenisDokumen" className="w-full p-2.5 border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.jenisDokumen} onChange={handleChange}>
                                <option value="UKL-UPL">UKL-UPL</option>
                                <option value="AMDAL">AMDAL</option>
                                <option value="SPPL">SPPL</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">5. Nomor Surat Permohonan <span className="text-red-500">*</span></label>
                            <input type="text" name="nomorSuratPermohonan" className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.nomorSuratPermohonan} onChange={handleChange} placeholder="Contoh: 660.1/123/2026..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">6. Tanggal Surat Permohonan <span className="text-red-500">*</span></label>
                            <input type="date" name="tanggalSuratPermohonan" className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.tanggalSuratPermohonan} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">7. Perihal Surat Permohonan <span className="text-red-500">*</span></label>
                            <input type="text" name="perihalSuratPermohonan" className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none" value={formData.perihalSuratPermohonan} onChange={handleChange} placeholder="Contoh: Permohonan Arahan Lingkungan..." required />
                        </div>
                    </div>
                </div>

                {/* 2. SEKSI KEGIATAN */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-blue-500" /> Detail Usaha / Kegiatan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">8. Nama Kegiatan <span className="text-red-500">*</span></label>
                            <input type="text" name="namaKegiatan" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.namaKegiatan} onChange={handleChange} placeholder="Nama rencana usaha/kegiatan..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">9. Jenis Kegiatan (Bidang Usaha) <span className="text-red-500">*</span></label>
                            <input type="text" name="jenisKegiatan" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.jenisKegiatan} onChange={handleChange} placeholder="Contoh: Kesehatan / Industri..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">10. Besaran Luasan <span className="text-red-500">*</span></label>
                            <div className="flex">
                                <input type="number" name="besaranLuasan" className="w-2/3 p-2.5 border rounded-l-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.besaranLuasan} onChange={handleChange} placeholder="Angka luasan..." required />
                                <select name="satuanLuasan" className="w-1/3 p-2.5 border-t border-b border-r rounded-r-lg bg-gray-100 outline-none font-bold text-gray-700" value={formData.satuanLuasan} onChange={handleChange}>
                                    <option value="m2">m²</option>
                                    <option value="Ha">Ha</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">11. Lokasi Kegiatan (Alamat) <span className="text-red-500">*</span></label>
                            <textarea name="lokasiKegiatan" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" rows={2} value={formData.lokasiKegiatan} onChange={handleChange} placeholder="Alamat lengkap lokasi kegiatan..." required />
                        </div>
                    </div>
                </div>

                {/* 3. SEKSI PEMRAKARSA & KONSULTAN */}
                <div className="bg-orange-50/30 p-6 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <User size={18} /> Data Pemrakarsa & Konsultan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">12. Pemrakarsa / Penanggungjawab <span className="text-red-500">*</span></label>
                            <input type="text" name="namaPemrakarsa" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" value={formData.namaPemrakarsa} onChange={handleChange} placeholder="Nama Instansi / Perusahaan / Pribadi..." required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">13. Nomor Telepon Pemrakarsa <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input type="text" name="teleponPemrakarsa" className="w-full pl-9 p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" value={formData.teleponPemrakarsa} onChange={handleChange} placeholder="0812xxxx..." required />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">14. Alamat Penanggungjawab <span className="text-red-500">*</span></label>
                            <textarea name="alamatPemrakarsa" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" rows={2} value={formData.alamatPemrakarsa} onChange={handleChange} placeholder="Alamat domisili atau kantor pusat..." required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-1 text-gray-700">15. Nama Konsultan Penyusun (Opsional)</label>
                            <input type="text" name="namaKonsultan" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" value={formData.namaKonsultan} onChange={handleChange} placeholder="Nama PT / CV Konsultan (jika ada)..." />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait">
                        {loading ? 'Menyimpan...' : <><Save size={20} /> Simpan Registrasi Amdalnet</>}
                    </button>
                </div>
            </form>

            <Modal show={modalInfo.show} title={modalInfo.title} onClose={closeModal}>
                <div className="flex flex-col items-center justify-center p-4">
                    {modalInfo.isSuccess ? <CheckCircle size={50} className="text-emerald-500 mb-4 animate-bounce" /> : <div className="text-red-500 mb-4 text-4xl">⚠️</div>}
                    <p className="text-center text-gray-700 font-medium">{modalInfo.message}</p>
                </div>
            </Modal>
        </div>
    );
}