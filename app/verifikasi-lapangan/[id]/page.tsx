'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifikasiLapanganDetail({ params }: { params: Promise<{ id: string }> }) {
    // Di sini 'id' adalah angka No Urut dari URL (misal: /verifikasi/101)
    const { id } = use(params); 
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    
    // State Form
    const [tanggalVerlap, setTanggalVerlap] = useState('');
    const [catatanVerlap, setCatatanVerlap] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // KITA PAKAI API LAMA (api/record/find)
            const res = await fetch('/api/record/find', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // RAHASIANYA DI SINI:
                // Kita kirim parameter 'id' dari URL sebagai 'noUrut' ke API.
                // API lama kamu ada 'parseInt(noUrut)', jadi dia akan mengubah "101" jadi angka 101.
                body: JSON.stringify({ noUrut: id }) 
            });
            
            const result = await res.json();
            
            if (result.success && result.data) {
                // Handle jika data array atau object tunggal
                const doc = Array.isArray(result.data) ? result.data[0] : result.data;
                setData(doc);
                
                // Isi form jika sudah ada data sebelumnya
                if(doc.tanggalVerlap) setTanggalVerlap(doc.tanggalVerlap);
                if(doc.catatanVerlap) setCatatanVerlap(doc.catatanVerlap);
            } else {
                alert("Data dengan No Urut tersebut tidak ditemukan!");
                router.push('/verifikasi-lapangan');
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Gagal memuat data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Simpan Hasil Verifikasi Lapangan?")) return;

        setSubmitting(true);
        try {
            // Endpoint simpan (sesuaikan dengan logic update database kamu)
            const res = await fetch('/api/submit/verlap', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data._id, // Saat simpan, kita ambil ID asli dari data yang sudah di-fetch
                    tanggalVerlap: tanggalVerlap,
                    catatanVerlap: catatanVerlap
                })
            });

            const result = await res.json();
            if (result.success) {
                alert("✅ Berhasil disimpan!");
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

    if (loading) return <div className="p-10 text-center">Memuat data No Urut: {id}...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
                
                {/* Header */}
                <div className="mb-6 border-b pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Verifikasi Lapangan</h1>
                        <p className="text-sm text-gray-500">No Urut: <span className="font-mono font-bold">{id}</span></p>
                    </div>
                    <Link href="/verifikasi-lapangan" className="text-sm text-blue-600 hover:underline">Kembali</Link>
                </div>

                {/* Info Singkat */}
                <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-900">
                    <p><strong>Kegiatan:</strong> {data.namaKegiatan || data.nama_kegiatan}</p>
                    <p><strong>Pemrakarsa:</strong> {data.namaPemrakarsa || data.pemrakarsa}</p>
                    <p><strong>No Registrasi:</strong> {data.nomorChecklist || data.no_registrasi}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Tanggal Verlap</label>
                        <input 
                            type="date" required 
                            className="border p-2 rounded w-full md:w-1/2"
                            value={tanggalVerlap}
                            onChange={(e) => setTanggalVerlap(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Catatan</label>
                        <textarea 
                            rows={3}
                            className="border p-2 rounded w-full"
                            value={catatanVerlap}
                            onChange={(e) => setCatatanVerlap(e.target.value)}
                        />
                    </div>
                    <button disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                        {submitting ? 'Menyimpan...' : 'Simpan Hasil'}
                    </button>
                </form>

            </div>
        </div>
    );
}