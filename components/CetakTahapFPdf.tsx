'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- STYLES (Mirip dengan Tahap A tapi disesuaikan) ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  // Table Utilities
  table: { 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0,
    marginBottom: 15
  }, 
  tableRow: { 
    margin: "auto", 
    flexDirection: "row" 
  }, 
  tableCol: { 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
  }, 
  tableCell: { 
    margin: 5, 
    fontSize: 10 
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold' // Workaround untuk bold standar
  },
  // Khusus Footer
  footerHeader: {
    backgroundColor: '#E7E6E6',
    fontWeight: 'bold'
  },
  signBox: {
    height: 100, // Tinggi area tanda tangan
    justifyContent: 'space-between',
    padding: 5
  }
});

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

// --- DOKUMEN PDF ---
export const TahapFDocument = ({ data }: any) => (
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
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '63%' }}><Text style={styles.tableCell}>{data.namaKegiatan}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Jenis Permohonan*</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '63%' }}><Text style={styles.tableCell}>{data.jenisDokumen}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Nomor Penerimaan Hasil Perbaikan</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '63%' }}><Text style={{...styles.tableCell, fontWeight: 'bold'}}>{data.nomorPHP}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '35%' }}><Text style={styles.tableCell}>Tanggal Masuk Berkas</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '63%' }}><Text style={styles.tableCell}>{formatDate(data.tanggalPenyerahanPerbaikan || data.tanggalPHP)}</Text></View>
        </View>
      </View>

      {/* TABEL FOOTER & TTD */}
      <View style={styles.table}>
          
          {/* Header Contact */}
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '100%', backgroundColor: '#E7E6E6' }}>
                   <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Contact Person (Nomor Telepon)</Text>
               </View>
          </View>

          {/* Isi Contact */}
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Pemrakarsa / Pemberi Kuasa</Text></View>
               <View style={{ ...styles.tableCol, width: '60%' }}><Text style={styles.tableCell}>: {data.namaPemrakarsa} ({data.teleponPemrakarsa})</Text></View>
          </View>
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Penerima Kuasa / Konsultan</Text></View>
               <View style={{ ...styles.tableCol, width: '60%' }}><Text style={styles.tableCell}>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</Text></View>
          </View>
          
          {/* KOMPLEKS: KOLOM CAP DAN TANDA TANGAN */}
          <View style={styles.tableRow}>
              {/* Kolom Kiri: Cap Dinas */}
              <View style={{ ...styles.tableCol, width: '35%', height: 130 }}>
                  <Text style={{...styles.tableCell, fontWeight:'bold'}}>Kolom Cap Dinas</Text>
              </View>

              {/* Kolom Kanan: Wrapper untuk Status dan TTD */}
              <View style={{ width: '65%' }}>
                  
                  {/* Baris Status */}
                  <View style={{ ...styles.tableCol, width: '100%', borderLeftWidth: 1, height: 30, justifyContent: 'center' }}>
                      <Text style={{...styles.tableCell, textAlign: 'center', fontWeight: 'bold'}}>
                          Status: Diterima untuk diperiksa
                      </Text>
                  </View>

                  {/* Baris Tanda Tangan (Dibagi 2 lagi) */}
                  <View style={{ flexDirection: 'row', height: 100 }}>
                      
                      {/* TTD Pengirim */}
                      <View style={{ ...styles.tableCol, width: '50%', borderTopWidth: 1, borderLeftWidth: 1, ...styles.signBox }}>
                          <Text style={{ fontSize: 9, textAlign:'center', fontWeight:'bold' }}>Yang Menyerahkan</Text>
                          <Text style={{ fontSize: 9, textAlign:'center', fontWeight:'bold', textDecoration:'underline' }}>({data.namaPengirim || '....................'})</Text>
                      </View>

                      {/* TTD Petugas */}
                      <View style={{ ...styles.tableCol, width: '50%', borderTopWidth: 1, ...styles.signBox }}>
                          <Text style={{ fontSize: 9, textAlign:'center', fontWeight:'bold' }}>Petugas MPP</Text>
                          <Text style={{ fontSize: 9, textAlign:'center', fontWeight:'bold', textDecoration:'underline' }}>({data.petugasPenerimaPerbaikan || '....................'})</Text>
                      </View>

                  </View>
              </View>
          </View>
      </View>

    </Page>
  </Document>
);