'use client';

import React, { useEffect, useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TandaTerimaData {
  id: string;
  noRegistrasi: string;
  tglTerima: string;
  tglTerimaRaw: Date;
  noSurat: string;
  tglSurat: string;
  perihal: string;
  namaPemrakarsa: string;
  alamatPemrakarsa: string;
  jenisDokumen: string;
  pengirim: string;
  petugas: string;
}

export default function TandaTerimaRegistrasi({ params }: { params: { id: string } }) {
  const [data, setData] = useState<TandaTerimaData | null>(null);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const today = new Date();
    // DATA DUMMY (Ganti dengan data asli nanti)
    setData({
      id: id,
      noRegistrasi: `REG-${id}/DLH/${today.getFullYear()}`,
      tglTerima: today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      tglTerimaRaw: today,
      noSurat: '660.1/045/V/2025',
      tglSurat: '20 Mei 2025',
      perihal: 'Permohonan Persetujuan Lingkungan Kegiatan Perumahan Graha Asri',
      namaPemrakarsa: 'PT. SUMBER REJEKI ABADI',
      alamatPemrakarsa: 'Jl. Raya Sukowati No. 45, Sragen',
      jenisDokumen: 'UKL-UPL',
      pengirim: 'Budi Santoso (Staf Teknik)',
      petugas: 'Siti Aminah (Petugas MPP)',
    });
  }, [id]);

  if (!data) return <div className="p-10 text-center font-bold">Memuat data...</div>;

  return (
    <>
      {/* --- CSS KHUSUS CETAK (SAFE MODE) --- */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            padding: 2cm;
            background: white;
            color: black !important;
            z-index: 9999;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* --- BACKGROUND LAYAR --- */}
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
        
        {/* Tombol Navigasi */}
        <div className="w-full max-w-[210mm] flex justify-between mb-6 no-print">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-slate-600 hover:text-green-700 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Kembali
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-lg"
          >
            <Printer size={20} className="mr-2" /> Cetak Dokumen
          </button>
        </div>

        {/* --- KERTAS SURAT (ID INI YANG AKAN DICETAK) --- */}
        {/* PERUBAHAN: Menggunakan 'font-sans' (Arial) untuk seluruh dokumen */}
        <div id="print-area" className="bg-white w-[210mm] min-h-[297mm] p-[2cm] shadow-2xl text-black relative font-sans">
          
          {/* === 1. KOP SURAT === */}
          <div className="flex items-center border-b-[4px] border-double border-black pb-2 mb-6">
              {/* Logo Wrapper */}
              <div className="w-[20%] flex justify-center items-center">
                   <img 
                      src="/logo-sragen.png" 
                      alt="Logo" 
                      className="w-20 h-auto object-contain"
                      onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const span = document.createElement('span');
                          span.innerText = "LOGO";
                          span.className = "border border-black p-2 font-bold";
                          e.currentTarget.parentElement?.appendChild(span);
                      }}
                   />
              </div>

              {/* Teks Kop (Sudah Arial dari awal) */}
              <div className="w-[80%] text-center pr-8"> 
                  <h3 className="text-[14pt] font-medium tracking-wide leading-tight text-black">
                      PEMERINTAH KABUPATEN SRAGEN
                  </h3>
                  <h1 className="text-[18pt] font-extrabold tracking-wider leading-tight text-black scale-y-110 mt-1">
                      DINAS LINGKUNGAN HIDUP
                  </h1>
                  <p className="text-[9pt] text-black mt-1 leading-tight">
                      Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214
                  </p>
                  <p className="text-[9pt] text-black leading-tight">
                      Telepon (0271) 891136, Faksimile (0271) 891136
                  </p>
                  <p className="text-[9pt] text-black leading-tight">
                      Laman www.dlh.sragenkab.go.id, Pos-el dlh@sragenkab.go.id
                  </p>
              </div>
          </div>

          {/* === 2. JUDUL SURAT === */}
          <div className="text-center mb-8 mt-4">
              <h3 className="text-[14pt] font-bold underline underline-offset-4 uppercase text-black">TANDA TERIMA DOKUMEN MASUK</h3>
              <p className="text-[11pt] mt-1 text-black">Nomor Registrasi: <b>{data.noRegistrasi}</b></p>
          </div>

          {/* === 3. ISI SURAT (TABEL) === */}
          <div className="mb-6 px-2">
              <table className="w-full text-[11pt] align-top text-black">
                  <tbody>
                      <tr>
                          <td className="w-[180px] pb-2 font-medium">Telah terima dari</td>
                          <td className="w-[20px] pb-2">:</td>
                          <td className="uppercase font-bold pb-2">{data.pengirim}</td>
                      </tr>
                      <tr>
                          <td className="pb-2 font-medium">Tanggal Diterima</td>
                          <td className="pb-2">:</td>
                          <td className="pb-2">{data.tglTerima}</td>
                      </tr>
                      <tr>
                          <td className="pb-2 font-medium">Untuk Perusahaan</td>
                          <td className="pb-2">:</td>
                          <td className="font-bold pb-2">{data.namaPemrakarsa}</td>
                      </tr>
                      <tr>
                          <td className="pb-2 font-medium">Alamat Perusahaan</td>
                          <td className="pb-2">:</td>
                          <td className="pb-2 leading-tight">{data.alamatPemrakarsa}</td>
                      </tr>
                      <tr>
                          <td className="pb-2 font-medium">Jenis Dokumen</td>
                          <td className="pb-2">:</td>
                          <td className="pb-2">
                              <span className="border border-black px-2 py-0.5 font-bold uppercase text-[10pt]">
                                  {data.jenisDokumen}
                              </span>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>

          {/* === 4. DASAR SURAT === */}
          <div className="mx-2 border-t border-black border-dashed pt-4 mb-10 text-black">
              <p className="text-[11pt] font-bold mb-2 underline">Dasar Surat Permohonan:</p>
              <table className="w-full text-[11pt] align-top">
                  <tbody>
                      <tr>
                          <td className="w-[180px] pb-1 font-medium">Nomor Surat</td>
                          <td className="w-[20px] pb-1">:</td>
                          <td className="font-bold pb-1">{data.noSurat}</td>
                      </tr>
                      <tr>
                          <td className="pb-1 font-medium">Tanggal Surat</td>
                          <td className="pb-1">:</td>
                          <td className="pb-1">{data.tglSurat}</td>
                      </tr>
                      <tr>
                          <td className="pb-1 align-top font-medium">Perihal</td>
                          <td className="pb-1">:</td>
                          <td className="italic pb-1 leading-tight">"{data.perihal}"</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          {/* === 5. TANDA TANGAN (POSISI SEJAJAR) === */}
          <div className="mt-8 px-2 text-[11pt] text-black">
              <div className="grid grid-cols-2 gap-10">
                  
                  {/* KOLOM KIRI */}
                  <div className="text-center pt-8">
                      <p className="mb-24">Yang Menyerahkan,</p>
                      <p className="font-bold underline uppercase">{data.pengirim}</p>
                      <p className="text-[10pt] mt-1">( Tanda Tangan & Nama Terang )</p>
                  </div>
                  
                  {/* KOLOM KANAN */}
                  <div className="text-center">
                      <p className="mb-2">Sragen, {data.tglTerimaRaw.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                      <p className="mb-24">Yang Menerima,</p>
                      <p className="font-bold underline uppercase">{data.petugas}</p>
                      <p className="text-[10pt] mt-1">( Petugas Pelayanan DLH )</p>
                  </div>

              </div>
          </div>

          {/* === FOOTER SYSTEM === */}
          <div className="absolute bottom-10 left-0 w-full text-center">
             <p className="text-[8pt] text-black italic border-t border-black w-3/4 mx-auto pt-2 font-sans">
                Dokumen ini dicetak melalui Sistem Informasi Pelayanan Dokumen Lingkungan Hidup (SIMON-DLH) Kab. Sragen.
             </p>
          </div>

        </div>
      </div>
    </>
  );
}