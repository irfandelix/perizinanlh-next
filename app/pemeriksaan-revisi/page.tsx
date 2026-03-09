'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { FileEdit, Loader2, Eye, AlertCircle } from 'lucide-react';

interface DokumenData {
  _id: string;
  noUrut: number;
  nomorChecklist: string;
  namaKegiatan?: string;   
  namaPemrakarsa?: string; 
  jenisDokumen: string;
  tanggalMasukDokumen: string;
  tahun?: string | number;
  statusTerakhir: string;
}

// 1. Ganti nama fungsi utama menjadi komponen internal
function PemeriksaanRevisiContent() {
  const [dataRevisi, setDataRevisi] = useState<DokumenData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/record/list'); 
        const json = await res.json();
        
        if (json.success) {
            const docs = json.data;
            setDataRevisi(docs);

            const yearsSet = new Set(docs.map((item: DokumenData) => {
                return item.tahun?.toString() || (item.tanggalMasukDokumen ? item.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString());
            }));
            
            const yearsArray = Array.from(yearsSet).sort().reverse() as string[];
            setAvailableYears(yearsArray);
            if (yearsArray.length > 0) setSelectedYear(yearsArray[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = dataRevisi.filter((doc) => {
      const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
      return docYear === selectedYear;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="mb-8 max-w-5xl mx-auto font-sans">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><FileEdit className="text-white w-6 h-6" /></div>
          Pemeriksaan Revisi (Tahap E)
        </h1>
        <p className="text-gray-400 mt-2 ml-14 text-xs font-bold uppercase tracking-widest">Daftar dokumen dalam proses perbaikan.</p>
      </div>

      <div className="max-w-5xl mx-auto">
          {availableYears.length > 0 && !loading && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 font-sans">
                  {availableYears.map((year) => (
                      <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                              selectedYear === year ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                          }`}
                      >
                          Tahun {year}
                      </button>
                  ))}
              </div>
          )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden font-sans">
            {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-blue-600">
                <Loader2 className="animate-spin w-10 h-10 mb-2" />
            </div>
            ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-gray-300">
                <AlertCircle className="w-12 h-12 mb-3 opacity-20" /><p className="font-bold uppercase text-xs tracking-widest">Kosong di tahun {selectedYear}</p>
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-blue-50/50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b border-blue-50">
                    <tr>
                    <th className="p-5 w-16 text-center">No</th>
                    <th className="p-5">Kegiatan & Dokumen</th>
                    <th className="p-5">Pemrakarsa</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-center w-32">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-5 text-center font-black text-gray-400">{item.noUrut}</td>
                        <td className="p-5">
                            <div className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-100 text-blue-700 mb-1 uppercase tracking-tighter">{item.jenisDokumen}</div>
                            <div className="font-black text-gray-800 uppercase line-clamp-1">{item.namaKegiatan || "(Tanpa Judul)"}</div>
                            <div className="font-mono text-[10px] text-gray-400 mt-1 tracking-tighter">{item.nomorChecklist}</div>
                        </td>
                        <td className="p-5 text-gray-600 font-bold text-xs">{item.namaPemrakarsa || "-"}</td>
                        <td className="p-5">
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black bg-yellow-50 text-yellow-700 border border-yellow-100 uppercase tracking-widest">
                                {item.statusTerakhir || 'PROSES'}
                            </span>
                        </td>
                        <td className="p-5 text-center">
                            <Link 
                              href={`/pemeriksaan-revisi/${item._id}?thn=${item.tahun}`} 
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
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
    </div>
  );
}

// 2. EXPORT UTAMA: Bungkus seluruh halaman ke dalam Suspense
export default function PemeriksaanRevisiPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Menyiapkan Halaman...</p>
            </div>
        }>
            <PemeriksaanRevisiContent />
        </Suspense>
    );
}