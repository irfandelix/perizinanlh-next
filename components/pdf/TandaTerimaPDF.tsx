import React from 'react';

// Props bisa disesuaikan dengan data Anda
export const TandaTerimaPDF = ({ data }: any) => {
  return (
    <div style={{ fontFamily: 'Times New Roman, serif', padding: '40px', color: 'black' }}>
      {/* KOP SURAT */}
      <div style={{ borderBottom: '4px double black', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>Pemerintah Kabupaten Sragen</h4>
        <h2 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase' }}>Dinas Lingkungan Hidup</h2>
        <p style={{ margin: 0, fontSize: '12px' }}>Jl. Raya Sukowati No. 20, Sragen, Jawa Tengah</p>
      </div>

    {/* JUDUL */}
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
    <h1 style={{ textDecoration: 'underline', fontSize: '20px', margin: 0 }}>TANDA TERIMA DOKUMEN</h1>
    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
        {/* Tampilkan nomorRegistrasi (dari hasil simpan DB). 
            Jika belum disimpan (masih kosong), tampilkan garis bawah.
            Pastikan Anda menambahkan 'nomorRegistrasi' ke definisi TypeScript/State formData jika perlu.
        */}
        Nomor Registrasi: <b>{data.nomorRegistrasi || "________"}</b> / DLH / {new Date().getFullYear()}
    </p>
    </div>

      {/* ISI */}
      <p>Telah diterima berkas dokumen pada tanggal <b>{data.tanggalMasukDokumen}</b>:</p>
      
      <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
          <tbody>
              <tr><td style={{ width: '200px', padding: '5px' }}>1. Nama Pemrakarsa</td><td>: <b>{data.namaPemrakarsa}</b></td></tr>
              <tr><td style={{ padding: '5px' }}>2. Judul Kegiatan</td><td>: {data.namaKegiatan}</td></tr>
              <tr><td style={{ padding: '5px' }}>3. Lokasi</td><td>: {data.lokasiKegiatan}</td></tr>
              <tr><td style={{ padding: '5px' }}>4. Jenis Dokumen</td><td>: {data.jenisDokumen}</td></tr>
          </tbody>
      </table>

      {/* TANDA TANGAN */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
              <p>Yang Menyerahkan,</p>
              <br /><br /><br />
              <p style={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>{data.namaPengirim}</p>
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
              <p>Petugas Penerima,</p>
              <br /><br /><br />
              <p style={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>{data.namaPetugas}</p>
          </div>
      </div>
    </div>
  );
};