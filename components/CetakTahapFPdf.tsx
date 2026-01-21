'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register Font agar Bold berfungsi dengan baik
Font.register({
  family: 'Times-Roman',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPSMT.ttf'
});
Font.register({
  family: 'Times-Bold',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-BoldMT.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Times-Bold',
    marginBottom: 20,
    textTransform: 'uppercase',
    textDecoration: 'underline'
  },
  // Table Utilities
  table: { 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#000',
    marginBottom: 15
  }, 
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid'
  }, 
  tableCol: { 
    borderRightWidth: 1, 
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 4
  }, 
  tableColLast: {
    padding: 4
  },
  tableCell: { 
    fontSize: 10 
  },
  bold: {
    fontFamily: 'Times-Bold'
  },
  footerHeader: {
    backgroundColor: '#E7E6E6',
  },
  signBox: {
    height: 100, 
    justifyContent: 'space-between',
    padding: 5
  }
});

const formatDate = (dateString: any) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

// --- DOKUMEN PDF ---
export const TahapFDocument = ({ data }: any) => {
  
  // LOGIKA DINAMIS:
  // Ambil data dari props khusus (nomorSurat, petugas, tanggalTerima) jika ada.
  // Jika tidak ada, baru fallback ke data default (nomorPHP biasa).
  const nomorSuratFinal = data.nomorSurat || data.nomorPHP;
  const tanggalFinal = data.tanggalTerima || data.tanggalPenyerahanPerbaikan || data.tanggalPHP;
  const petugasFinal = data.petugas || data.petugasPenerimaPerbaikan;
  const labelPHP = data.phpKe ? `(${data.phpKe})` : ''; // Contoh output: "(PHP Ke-2)"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* JUDUL */}
        <Text style={styles.title}>
          TANDA TERIMA BERKAS{'\n'}PERBAIKAN DOKUMEN LINGKUNGAN
        </Text>

        {/* TABEL INFO UTAMA */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Nama Kegiatan</Text></View>
              <View style={{ ...styles.tableCol, width: '2%', textAlign:'center' }}><Text style={styles.tableCell}>:</Text></View>
              <View style={{ ...styles.tableColLast, width: '63%' }}><Text style={styles.tableCell}>{data.namaKegiatan}</Text></View>
          </View>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Jenis Permohonan</Text></View>
              <View style={{ ...styles.tableCol, width: '2%', textAlign:'center' }}><Text style={styles.tableCell}>:</Text></View>
              <View style={{ ...styles.tableColLast, width: '63%' }}><Text style={styles.tableCell}>{data.jenisDokumen}</Text></View>
          </View>
          
          {/* BAGIAN PENTING: NOMOR SURAT DINAMIS */}
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '35%' }}>
                  <Text style={styles.tableCell}>Nomor Penerimaan Hasil Perbaikan {labelPHP}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '2%', textAlign:'center' }}><Text style={styles.tableCell}>:</Text></View>
              <View style={{ ...styles.tableColLast, width: '63%' }}>
                  <Text style={{...styles.tableCell, ...styles.bold}}>{nomorSuratFinal}</Text>
              </View>
          </View>

          {/* BAGIAN PENTING: TANGGAL DINAMIS */}
          <View style={{ ...styles.tableRow, borderBottomWidth: 0 }}>
              <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Tanggal Masuk Berkas</Text></View>
              <View style={{ ...styles.tableCol, width: '2%', textAlign:'center' }}><Text style={styles.tableCell}>:</Text></View>
              <View style={{ ...styles.tableColLast, width: '63%' }}>
                  <Text style={styles.tableCell}>{formatDate(tanggalFinal)}</Text>
              </View>
          </View>
        </View>

        {/* TABEL FOOTER & TTD */}
        <View style={styles.table}>
            
            {/* Header Contact */}
            <View style={styles.tableRow}>
                 <View style={{ ...styles.tableColLast, width: '100%', ...styles.footerHeader }}>
                     <Text style={{...styles.tableCell, ...styles.bold}}>Contact Person (Nomor Telepon)</Text>
                 </View>
            </View>

            {/* Isi Contact */}
            <View style={styles.tableRow}>
                 <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Pemrakarsa / Pemberi Kuasa</Text></View>
                 <View style={{ ...styles.tableColLast, width: '60%' }}><Text style={styles.tableCell}>: {data.namaPemrakarsa} ({data.teleponPemrakarsa || '-'})</Text></View>
            </View>
            <View style={styles.tableRow}>
                 <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Penerima Kuasa / Konsultan</Text></View>
                 <View style={{ ...styles.tableColLast, width: '60%' }}><Text style={styles.tableCell}>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</Text></View>
            </View>
            
            {/* KOMPLEKS: KOLOM CAP DAN TANDA TANGAN */}
            <View style={{ flexDirection: 'row' }}>
                {/* Kolom Kiri: Cap Dinas */}
                <View style={{ width: '35%', borderRightWidth: 1, borderColor: '#000' }}>
                    <View style={{ height: 130, padding: 5 }}>
                        <Text style={{...styles.tableCell, ...styles.bold, textAlign: 'center'}}>Kolom Cap Dinas</Text>
                    </View>
                </View>

                {/* Kolom Kanan: Wrapper untuk Status dan TTD */}
                <View style={{ width: '65%' }}>
                    
                    {/* Baris Status */}
                    <View style={{ borderBottomWidth: 1, borderColor: '#000', height: 30, justifyContent: 'center' }}>
                        <Text style={{...styles.tableCell, textAlign: 'center', ...styles.bold}}>
                            Status: Diterima untuk diperiksa
                        </Text>
                    </View>

                    {/* Baris Tanda Tangan */}
                    <View style={{ flexDirection: 'row', height: 100 }}>
                        
                        {/* TTD Pengirim */}
                        <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', ...styles.signBox }}>
                            <Text style={{ fontSize: 9, textAlign:'center', ...styles.bold }}>Yang Menyerahkan</Text>
                            <Text style={{ fontSize: 9, textAlign:'center', ...styles.bold, textDecoration:'underline' }}>
                                ({data.namaPengirim || '....................'})
                            </Text>
                        </View>

                        {/* TTD Petugas (DINAMIS) */}
                        <View style={{ width: '50%', ...styles.signBox }}>
                            <Text style={{ fontSize: 9, textAlign:'center', ...styles.bold }}>Petugas MPP</Text>
                            <Text style={{ fontSize: 9, textAlign:'center', ...styles.bold, textDecoration:'underline' }}>
                                ({petugasFinal || '....................'})
                            </Text>
                        </View>

                    </View>
                </View>
            </View>
        </View>

      </Page>
    </Document>
  );
};