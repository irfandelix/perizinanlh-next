import React from 'react';

// Format tanggal bahasa Indonesia
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

// Data Checklist Static
const allChecklistItems = [
    "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", 
    "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
    "Dokumen Lingkungan", 
    "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan di Kertas A3", 
    "PKKPR",
    "NIB (Untuk Swasta atau Perorangan)", 
    "Fotocopy Status Lahan (Sertifikat)", 
    "Fotocopy KTP Penanggungjawab Kegiatan",
    "Foto Eksisting Lokasi Rencana Kegiatan Disertai dengan Titik Koordinat", 
    "Lembar Penapisan dari AMDALNET / Arahan dari Instansi Lingkungan Hidup",
    "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)", 
    "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)",
    "Pemenuhan Persetujuan Teknis Air Limbah*", 
    "Pemenuhan Rincian Teknis Limbah B3 Sementara*", 
    "Pemenuhan Persetujuan Teknis Emisi*",
    "Pemenuhan Persetujuan Teknis Andalalin*", 
    "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis*",
    "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING"
];

export const ChecklistPrintTemplate = ({ data, checklistStatus, statusVerifikasi }: any) => {
  // Style pembantu untuk border tabel yang rapi
  const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '10px', fontSize: '12px' };
  const cellStyle = { border: '1px solid black', padding: '4px 8px' };
  const headerCellStyle = { ...cellStyle, backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center' as const };

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', padding: '40px', color: 'black', backgroundColor: 'white' }}>
      
      {/* JUDUL */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>
          CHECKLIST KELENGKAPAN BERKAS
        </h2>
        <h3 style={{ fontSize: '14px', margin: '5px 0', textTransform: 'uppercase' }}>
          PERMOHONAN PERSETUJUAN LINGKUNGAN
        </h3>
      </div>

      {/* INFORMASI KEGIATAN */}
      <table style={{ ...tableStyle, border: '1px solid black' }}>
        <tbody>
            <tr>
                <td style={{ ...cellStyle, width: '30%', borderRight: 'none' }}>Nama Kegiatan</td>
                <td style={{ ...cellStyle, width: '2%', borderLeft: 'none', borderRight: 'none' }}>:</td>
                <td style={{ ...cellStyle, borderLeft: 'none' }}>{data.namaKegiatan}</td>
            </tr>
            <tr>
                <td style={{ ...cellStyle, borderRight: 'none' }}>Jenis Permohonan*</td>
                <td style={{ ...cellStyle, borderLeft: 'none', borderRight: 'none' }}>:</td>
                <td style={{ ...cellStyle, borderLeft: 'none' }}>{data.jenisDokumen}</td>
            </tr>
            <tr>
                <td style={{ ...cellStyle, borderRight: 'none' }}>No. Surat Permohonan</td>
                <td style={{ ...cellStyle, borderLeft: 'none', borderRight: 'none' }}>:</td>
                <td style={{ ...cellStyle, borderLeft: 'none' }}>{data.nomorSuratPermohonan || '-'}</td>
            </tr>
            <tr>
                <td style={{ ...cellStyle, borderRight: 'none' }}>Tanggal Masuk</td>
                <td style={{ ...cellStyle, borderLeft: 'none', borderRight: 'none' }}>:</td>
                <td style={{ ...cellStyle, borderLeft: 'none' }}>{formatDate(data.tanggalMasukDokumen)}</td>
            </tr>
        </tbody>
      </table>

      {/* TABEL CHECKLIST */}
      <table style={tableStyle}>
        <thead>
            <tr>
                <th style={{ ...headerCellStyle, width: '5%' }}>No</th>
                <th style={headerCellStyle}>Persyaratan Dokumen</th>
                <th style={{ ...headerCellStyle, width: '15%' }}>Ada / Tidak</th>
                <th style={{ ...headerCellStyle, width: '20%' }}>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            {allChecklistItems.map((item, index) => {
                const isChecked = checklistStatus[index]; // Ambil status centang
                return (
                    <tr key={index}>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>{index + 1}</td>
                        <td style={cellStyle}>{item}</td>
                        <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>
                            {isChecked ? 'V' : ''}
                        </td>
                        <td style={cellStyle}>
                            {/* Keterangan kosong manual atau bisa diambil dari state notes jika ada */}
                        </td>
                    </tr>
                );
            })}
        </tbody>
      </table>

      {/* FOOTER & TANDA TANGAN */}
      <div style={{ border: '1px solid black', marginTop: '20px', fontSize: '12px' }}>
          {/* Header Contact */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid black' }}>
              Contact Person
          </div>
          
          <div style={{ padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                      <tr>
                          <td style={{ width: '30%' }}>Pemohon</td>
                          <td>: {data.namaPemrakarsa} ({data.teleponPemrakarsa})</td>
                      </tr>
                      <tr>
                          <td>Penerima Kuasa</td>
                          <td>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          {/* Area Tanda Tangan */}
          <div style={{ display: 'flex', borderTop: '1px solid black' }}>
              {/* Kolom Kiri: Cap Dinas */}
              <div style={{ width: '40%', padding: '10px', borderRight: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minHeight: '100px' }}>
                  (Ruang Cap Dinas)
              </div>

              {/* Kolom Kanan: Status & TTD */}
              <div style={{ width: '60%' }}>
                  {/* Status */}
                  <div style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid black', fontWeight: 'bold' }}>
                      Status Kelengkapan: {statusVerifikasi.toUpperCase()}
                  </div>
                  
                  {/* Tanda Tangan Wrapper */}
                  <div style={{ display: 'flex' }}>
                      <div style={{ width: '50%', padding: '10px', borderRight: '1px solid black', textAlign: 'center' }}>
                          <p style={{ marginBottom: '50px', fontSize: '11px' }}>Pemohon / Penyerah</p>
                          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaPengirim}</p>
                      </div>
                      <div style={{ width: '50%', padding: '10px', textAlign: 'center' }}>
                          <p style={{ marginBottom: '50px', fontSize: '11px' }}>Petugas Penerima</p>
                          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaPetugas}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <p style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '10px' }}>
        *) Berlaku untuk UKL-UPL
      </p>

    </div>
  );
};