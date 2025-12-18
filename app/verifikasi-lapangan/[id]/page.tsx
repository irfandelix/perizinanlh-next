'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Komponen Halaman Detail Verifikasi Lapangan
export default function VerifikasiLapanganDetail({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params (Next.js 15 style)
    const { id } = use(params);
    const router = useRouter();

    // State Management
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    
    // Form State khusus Verlap
    const [tanggalVerlap, setTanggalVerlap] = useState('');
    const [catatanVerlap, setCatatanVerlap] = useState(''); // Tambahan untuk temuan lapangan
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch Data saat ID tersedia
    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
            // Cek dulu apakah ID benar-benar ada
            if (!id) return;

            console.log("Mengirim ID ke API:", id); // Debugging: Cek di Console Browser

            try {
                const res = await fetch('/api/record/find', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // PERBAIKAN DI SINI:
                    // Gunakan 'noUrut' jika itu yang diminta backendmu sebelumnya
                    body: JSON.stringify({ noUrut: id }) 
                });
                
                if (!res.ok) {
                    // Tangkap jika status selain 200 (misal 400 atau 500)
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const result = await res.json();
                
                if (result.success && result.data) {
                    const doc = Array.isArray(result.data) ? result.data[0] : result.data;
                    setData(doc);
                    
                    // Pre-fill state
                    if(doc.tanggalVerlap) setTanggalVerlap(doc.tanggalVerlap);
                    if(doc.catatanVerlap) setCatatanVerlap(doc.catatanVerlap);
                } else {
                    alert("Data permohonan tidak ditemukan!");
                    // router.push('/verifikasi-lapangan'); // Comment dulu biar bisa lihat error
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Gagal memuat data. Cek Console.");
            } finally {
                setLoading(false);
            }
        };

    // 2. Handle Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Simpan hasil Verifikasi Lapangan dan Terbitkan Berita Acara?")) return;

        setSubmitting(true);
        try {
            // POST ke Endpoint khusus Verlap (sesuaikan URL API-mu)
            const res = await fetch('/api/submit/verlap', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data._id || id, // Pastikan ID terkirim
                    tanggalVerlap: tanggalVerlap,
                    catatanVerlap: catatanVerlap
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil! Berita Acara Verlap diterbitkan.");
                router.push('/verifikasi-lapangan'); // Kembali ke tabel
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem saat menyimpan.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Loading State
    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data verifikasi...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8">
                
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Verifikasi Lapangan</h1>
                    <Link href="/verifikasi-lapangan" className="text-sm text-gray-500 hover:text-green-600">
                        ← Kembali ke Daftar
                    </Link>
                </div>

                {/* Info Dokumen Box */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500">Nomor Registrasi:</p>
                            <p className="font-bold font-mono text-green-900 text-lg">
                                {data.no_registrasi || data.nomorChecklist || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Pemrakarsa:</p>
                            <p className="font-semibold text-gray-800">{data.pemrakarsa || data.namaPemrakarsa}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Lokasi / Alamat Kegiatan:</p>
                            <p className="font-semibold text-gray-700">
                                {data.alamat_kegiatan || data.lokasi || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Input Hasil Verlap */}
                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4 text-green-800">Input Hasil Verifikasi Lapangan</h3>
                    
                    {/* Input Tanggal */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Pelaksanaan
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={tanggalVerlap}
                            onChange={(e) => setTanggalVerlap(e.target.value)}
                        />
                    </div>

                    {/* Input Catatan (TextArea) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan / Temuan Lapangan
                        </label>
                        <textarea 
                            rows={4}
                            placeholder="Tuliskan temuan atau catatan verifikasi di sini..."
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={catatanVerlap}
                            onChange={(e) => setCatatanVerlap(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors w-full md:w-auto ${
                                submitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {submitting ? 'Sedang Menyimpan...' : '✅ Simpan & Terbitkan BA Verlap'}
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-3">
                         Sistem akan otomatis men-generate Nomor Berita Acara (BA) Verlap setelah disimpan.
                    </p>
                </form>

            </div>
        </div>
    );
}