"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileEdit, Loader2, Eye, AlertCircle } from 'lucide-react';

// --- TYPE DEFINITION ---
// Sesuaikan dengan data yang dikembalikan oleh API /api/record/list
interface DokumenData {
  _id: string;
  noUrut: number;
  judul_kegiatan?: string;   
  nama_pemrakarsa?: string;
  jenisDokumen: string;
  tanggalMasukDokumen: string;
  statusTerakhir: string;
  nomorBAPemeriksaan?: string; // Field indikator sudah diperiksa
  nomorPHP?: string;           // Field indikator ada PHP
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: DokumenData[];
  message?: string;
}

export default function PemeriksaanRevisiPage() {
  const [dataRevisi, setDataRevisi] = useState<DokumenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // PANGGIL API DENGAN MODE REVISI
        // Ini akan memicu filter: Sudah BAP + Ada PHP + Belum Risalah
        const res = await fetch('/api/record/list?mode=revisi'); 
        const json: ApiResponse = await res.json();
        
        if (json.success) {
          setDataRevisi(json.data);
        } else {
          console.error(json.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      
      {/* HEADER HALAMAN */}
      <div className="mb-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-md">
            <FileEdit className="text-white w-6 h-6" />
          </div>
          Pemeriksaan Revisi (Tahap E)
        </h1>
        <p className="text-gray-500 mt-2 ml-14">
          Daftar dokumen yang sedang dalam proses perbaikan (Revisi) dan menunggu verifikasi.
        </p>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {loading ? (
          // LOADING STATE
          <div className="flex flex-col items-center justify-center p-12 text-blue-600">
            <Loader2 className="animate-spin w-8 h-8 mb-2" />
            <span className="text-sm">Memuat data revisi...</span>
          </div>
        ) : dataRevisi.length === 0 ? (
          // EMPTY STATE (KOSONG)
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
            <p>Tidak ada dokumen yang menunggu pemeriksaan revisi saat ini.</p>
          </div>
        ) : (
          // TABEL DATA
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-blue-900 font-semibold border-b border-blue-100">
                <tr>
                  <th className="p-4 w-16 text-center">No Urut</th>
                  <th className="p-4">Jenis & Judul</th>
                  <th className="p-4">Pemrakarsa</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataRevisi.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-center font-mono text-gray-500 bg-gray-50/50">
                      {item.noUrut}
                    </td>
                    <td className="p-4">
                      <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 mb-1">
                        {item.jenisDokumen}
                      </div>
                      <div className="font-medium text-gray-800 line-clamp-2">
                        {item.judul_kegiatan || "(Tanpa Judul)"}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.nama_pemrakarsa || "-"}
                    </td>
                    <td className="p-4">
                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                         {item.statusTerakhir}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* Pastikan link ini mengarah ke folder detail yang benar.
                          Misalnya: /pemeriksaan-revisi/[noUrut]
                      */}
                      <Link 
                        href={`/pemeriksaan-revisi/${item.noUrut}`} 
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm"
                      >
                        <Eye size={14} /> Periksa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}