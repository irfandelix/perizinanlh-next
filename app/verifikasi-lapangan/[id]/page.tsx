'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifikasiLapanganDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // ID disini adalah noUrut (angka)
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [tanggalVerlap, setTanggalVerlap] = useState('');
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
                // Jika sudah ada data tanggal, isi otomatis
                if(doc.tanggalVerlap) setTanggalVerlap(doc.tanggalVerlap);
            } else {
                alert("Data tidak ditemukan!");
                router.push('/verifikasi-lapangan');
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Apakah Anda yakin ingin menerbitkan BA Verifikasi Lapangan?")) return;

        setSubmitting(true);
        try {
            // POST ke Endpoint TAHAP C
            const res = await fetch('/api/submit/c', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noUrut: data.noUrut,
                    tanggalVerifikasi: tanggalVerlap // Sesuai field di API Tahap C
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil! BA Verifikasi Lapangan diterbitkan.");
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

    if (loading) return <div className="p-8 text-center">Memuat data...</div>;
    if (!data) return <div className="p-8 text-center">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8">
                
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Verifikasi Lapangan</h1>
                    <Link href="/verifikasi-lapangan" className="text-sm text-gray-500 hover:text-green-600">
                        ← Kembali ke Daftar
                    </Link>
                </div>

                {/* Info Dokumen */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500">Nomor Registrasi:</p>
                            <p className="font-bold font-mono text-green-800 text-lg">{data.nomorChecklist}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Nomor Uji Administrasi:</p>
                            <p className="font-semibold text-orange-700">{data.nomorUjiBerkas || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Kegiatan:</p>
                            <p className="font-semibold">{data.namaKegiatan} (Oleh: {data.namaPemrakarsa})</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t pt-6">
                    <h3 className="font-bold text-lg mb-4 text-green-800">Input Hasil Kunjungan Lapangan</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Pelaksanaan Verifikasi
                        </label>
                        <input 
                            type="date"
                            required
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                            value={tanggalVerlap}
                            onChange={(e) => setTanggalVerlap(e.target.value)}
                        />
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                                submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {submitting ? 'Menyimpan...' : '✅ Simpan & Terbitkan BA Lapangan'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}