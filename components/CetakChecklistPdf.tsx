'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Opsional: Register font agar terlihat lebih resmi (misal Times New Roman jika ada file fontnya)
// Untuk sekarang kita pakai font bawaan (Helvetica/Arial)

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  // Simulasi Tabel dengan Flexbox
  table: { 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0,
    marginBottom: 10
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
    margin: 4, 
    fontSize: 9 
  },
  // Khusus Header Tabel
  tableColHeader: {
    backgroundColor: '#E7E6E6',
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
  },
  headerText: {
    margin: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  // Footer area
  footerTable: {
    marginTop: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  signBox: {
    height: 80, // Ruang untuk tanda tangan
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});

// List Checklist (Sama seperti kodemu)
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

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

// Komponen Dokumen PDF
export const ChecklistDocument = ({ data, checkedItems, statusBerkas }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* JUDUL */}
      <Text style={styles.headerTitle}>
        CHECKLIST KELENGKAPAN BERKAS{'\n'}PERMOHONAN PERSETUJUAN LINGKUNGAN
      </Text>

      {/* TABEL INFO ATAS */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>Nama Kegiatan</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '68%' }}><Text style={styles.tableCell}>{data.namaKegiatan}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>Jenis Permohonan*</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '68%' }}><Text style={styles.tableCell}>{data.jenisDokumen}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>No. Checklist</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '68%' }}><Text style={styles.tableCell}>{data.nomorChecklist}</Text></View>
        </View>
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>Tanggal Masuk</Text></View>
            <View style={{ ...styles.tableCol, width: '2%' }}><Text style={styles.tableCell}>:</Text></View>
            <View style={{ ...styles.tableCol, width: '68%' }}><Text style={styles.tableCell}>{formatDate(data.tanggalMasukDokumen)}</Text></View>
        </View>
      </View>

      {/* TABEL CHECKLIST */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRow}>
            <View style={{ ...styles.tableColHeader, width: '8%' }}>
                <Text style={styles.headerText}>No</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: '77%' }}>
                <Text style={styles.headerText}>Kelengkapan Berkas</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: '15%' }}>
                <Text style={styles.headerText}>Checklist</Text>
            </View>
        </View>

        {/* Body */}
        {allChecklistItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
                <View style={{ ...styles.tableCol, width: '8%' }}>
                    <Text style={{...styles.tableCell, textAlign: 'center'}}>{index + 1}</Text>
                </View>
                <View style={{ ...styles.tableCol, width: '77%' }}>
                    <Text style={styles.tableCell}>{item}</Text>
                </View>
                <View style={{ ...styles.tableCol, width: '15%' }}>
                    <Text style={{...styles.tableCell, textAlign: 'center', fontWeight: 'bold'}}>
                        {/* Jika dicentang render V, jika tidak kosong */}
                        {checkedItems[item] ? 'V' : ''}
                    </Text>
                </View>
            </View>
        ))}
      </View>

      {/* FOOTER & TANDA TANGAN */}
      <View style={styles.footerTable}>
          {/* Baris Kontak */}
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '100%', backgroundColor: '#E7E6E6' }}>
                   <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Contact Person</Text>
               </View>
          </View>
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Pemohon</Text></View>
               <View style={{ ...styles.tableCol, width: '60%' }}><Text style={styles.tableCell}>: {data.namaPemrakarsa} ({data.teleponPemrakarsa})</Text></View>
          </View>
          <View style={styles.tableRow}>
               <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCell}>Penerima Kuasa</Text></View>
               <View style={{ ...styles.tableCol, width: '60%' }}><Text style={styles.tableCell}>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</Text></View>
          </View>
          
          {/* Baris Tanda Tangan */}
          <View style={styles.tableRow}>
              {/* Kolom Cap Dinas */}
              <View style={{ ...styles.tableCol, width: '35%', height: 100 }}>
                  <Text style={{...styles.tableCell, fontWeight:'bold'}}>Kolom Cap Dinas</Text>
              </View>

              {/* Kolom Status & TTD */}
              <View style={{ width: '65%' }}>
                  {/* Status */}
                  <View style={{ ...styles.tableCol, width: '100%', borderLeftWidth: 1 }}>
                      <Text style={{...styles.tableCell, textAlign: 'center', fontWeight: 'bold'}}>
                          Status Kelengkapan: {statusBerkas}
                      </Text>
                  </View>
                  {/* TTD Box */}
                  <View style={{ flexDirection: 'row' }}>
                      <View style={{ ...styles.tableCol, width: '50%', borderTopWidth: 1, borderLeftWidth: 1, ...styles.signBox }}>
                          <Text style={{ fontSize: 8, marginBottom: 30 }}>Pemohon / Penyerah</Text>
                          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>({data.namaPengirim})</Text>
                      </View>
                      <View style={{ ...styles.tableCol, width: '50%', borderTopWidth: 1, ...styles.signBox }}>
                          <Text style={{ fontSize: 8, marginBottom: 30 }}>Petugas MPP</Text>
                          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>({data.namaPetugas})</Text>
                      </View>
                  </View>
              </View>
          </View>
      </View>
      
      <Text style={{ fontSize: 8, marginTop: 5, fontStyle: 'italic' }}>*) Berlaku untuk UKL-UPL</Text>

    </Page>
  </Document>
);