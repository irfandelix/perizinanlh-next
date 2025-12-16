'use client';

import React, { useState, useEffect, use } from 'react'; // Tambah 'use' untuk params
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UjiAdministrasiDetail({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params (Next.js 15/Terbaru butuh ini)
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [tanggalUji, setTanggalUji] = useState('');
    const [submitting, setSubmitting] = useState(false);

useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Panggil API Find dengan parameter 'noUrut'
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noUrut: id }) // <--- KITA KIRIM ID (ANGKA) LANGSUNG
            });
            const result = await res.json();
            
            if (result.success && result.data) {
                // Handle array
                const doc = Array.isArray(result.data) ? result.data[0] : result.data;
                setData(doc);
            } else {
                alert("Data tidak ditemukan!");
                router.push('/uji-administrasi');
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Apakah Anda yakin ingin menerbitkan Berita Acara ini?")) return;

        setSubmitting(true);
        try {
            // Kirim ke API Submit Tahap B (Uji Administrasi)
            const res = await fetch('/api/submit/b', { // <-- Endpoint Tahap B
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noUrut: data.noUrut,
                    tanggalPenerbitanUa: tanggalUji // Sesuai field di API Tahap B
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil! Dokumen lanjut ke Tahap Verifikasi Lapangan.");
                router.push('/uji-administrasi'); // Kembali ke antrian
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Memuat data...</div>;
    if (!data) return <div className="p-8 text-center">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8">
                
                {/* Header Navigasi */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Verifikasi Administrasi</h1>
                    <Link href="/uji-administrasi" className="text-sm text-gray-500 hover:text-blue-600">
                        ← Kembali ke Antrian
                    </Link>
                </div>

                {/* Informasi Dokumen */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500">Nomor Registrasi:</p>
                            <p className="font-bold font-mono text-blue-700 text-lg">{data.nomorChecklist}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Tanggal Masuk:</p>
                            <p className="font-semibold">{data.tanggalMasukDokumen}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Pemrakarsa:</p>
                            <p className="font-semibold">{data.namaPemrakarsa}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Kegiatan:</p>
                            <p className="font-semibold">{data.namaKegiatan}</p>
                        </div>
                    </div>
                </div>

                {/* Form Verifikasi */}
                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4">Terbitkan Berita Acara (Tahap B)</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Uji Administrasi (Penerbitan BA)
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={tanggalUji}
                            onChange={(e) => setTanggalUji(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {submitting ? 'Menyimpan...' : '✅ Verifikasi & Terbitkan BA'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        *Dengan mengklik tombol ini, status dokumen akan diperbarui dan Nomor Uji Berkas akan digenerate otomatis.
                    </p>
                </form>

            </div>
        </div>
    );
}