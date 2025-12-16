'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PemeriksaanSubstansiDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noUrut: id })
            });
            const result = await res.json();
            
            if (result.success && result.data) {
                const doc = Array.isArray(result.data) ? result.data[0] : result.data;
                setData(doc);
                if(doc.tanggalPemeriksaan) setTanggalPemeriksaan(doc.tanggalPemeriksaan);
            } else {
                alert("Data tidak ditemukan!");
                router.push('/pemeriksaan-substansi');
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Terbitkan Berita Acara Pemeriksaan Substansi?")) return;

        setSubmitting(true);
        try {
            // POST ke Endpoint TAHAP D
            const res = await fetch('/api/submit/d', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noUrut: data.noUrut,
                    tanggalPemeriksaan: tanggalPemeriksaan 
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil! BA Pemeriksaan diterbitkan.");
                router.push('/pemeriksaan-substansi');
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
                
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Pemeriksaan Substansi</h1>
                    <Link href="/pemeriksaan-substansi" className="text-sm text-gray-500 hover:text-indigo-600">
                        ← Kembali ke Daftar
                    </Link>
                </div>

                {/* Info Dokumen */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500">Nomor Registrasi:</p>
                            <p className="font-bold font-mono text-indigo-900 text-lg">{data.nomorChecklist}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Dasar (No Verlap):</p>
                            <p className="font-semibold text-green-700">{data.nomorBAVerlap || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Kegiatan:</p>
                            <p className="font-semibold">{data.namaKegiatan} (Oleh: {data.namaPemrakarsa})</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4 text-indigo-800">Input Hasil Rapat / Pemeriksaan</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Pemeriksaan (Rapat)
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={tanggalPemeriksaan}
                            onChange={(e) => setTanggalPemeriksaan(e.target.value)}
                        />
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {submitting ? 'Menyimpan...' : '✅ Simpan & Terbitkan BA Pemeriksaan'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                         Setelah ini dokumen akan siap untuk Revisi oleh Pemrakarsa (Tahap E) atau Penerbitan Rekomendasi (Tahap G).
                    </p>
                </form>

            </div>
        </div>
    );
}