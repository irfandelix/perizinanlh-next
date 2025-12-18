'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifikasiLapanganDetail({ params }: { params: Promise<{ id: string }> }) {
    // 1. Ambil ID dari params (Cara Next.js 15)
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    
    // State Form
    const [tanggalVerlap, setTanggalVerlap] = useState('');
    const [catatanVerlap, setCatatanVerlap] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 2. useEffect persis seperti Pemeriksaan Page
    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    // 3. Fungsi Fetch Data (Disamakan TOTAL dengan Pemeriksaan)
    const fetchData = async () => {
        try {
            // Logika ini yg membuat Pemeriksaan Page berhasil
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noUrut: id }) // KUNCINYA DI SINI: kirim sebagai 'noUrut'
            });
            const result = await res.json();
            
            if (result.success && result.data) {
                const doc = Array.isArray(result.data) ? result.data[0] : result.data;
                setData(doc);
                
                // Isi state jika data sudah pernah disimpan sebelumnya
                if(doc.tanggalVerlap) setTanggalVerlap(doc.tanggalVerlap);
                if(doc.catatanVerlap) setCatatanVerlap(doc.catatanVerlap);
            } else {
                alert("Data tidak ditemukan!");
                router.push('/verifikasi-lapangan');
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Gagal memuat data (Koneksi/Server Error)");
        } finally {
            setLoading(false);
        }
    };

    // 4. Handle Submit (Simpan)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Terbitkan Berita Acara Verifikasi Lapangan?")) return;

        setSubmitting(true);
        try {
            // Gunakan endpoint khusus verlap atau endpoint umum yg disesuaikan
            const res = await fetch('/api/submit/verlap', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data._id || id, // Kirim ID asli
                    tanggalVerlap: tanggalVerlap,
                    catatanVerlap: catatanVerlap
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil! BA Verlap diterbitkan.");
                router.push('/verifikasi-lapangan');
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8">
                
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Verifikasi Lapangan</h1>
                    <Link href="/verifikasi-lapangan" className="text-sm text-gray-500 hover:text-green-600">
                        ← Kembali ke Daftar
                    </Link>
                </div>

                {/* INFO DOKUMEN */}
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
                            <p className="text-gray-500">Kegiatan:</p>
                            <p className="font-semibold text-gray-700">
                                {data.nama_kegiatan || data.namaKegiatan || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM INPUT */}
                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4 text-green-800">Input Hasil Lapangan</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Verifikasi
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                            value={tanggalVerlap}
                            onChange={(e) => setTanggalVerlap(e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan Lapangan
                        </label>
                        <textarea 
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Tuliskan temuan di sini..."
                            value={catatanVerlap}
                            onChange={(e) => setCatatanVerlap(e.target.value)}
                        />
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors w-full md:w-auto ${
                                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {submitting ? 'Menyimpan...' : '✅ Simpan & Terbitkan BA'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}