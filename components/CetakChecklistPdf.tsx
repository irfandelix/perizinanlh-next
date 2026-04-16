'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.2,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  // Simulasi Tabel dengan Flexbox
  table: { 
    width: "100%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0,
    marginBottom: 10
  }, 
  tableRow: { 
    flexDirection: "row" 
  }, 
  tableCol: { 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    padding: 4,
  }, 
  tableCell: { 
    fontSize: 8.5 
  },
  // Khusus Header Tabel
  tableColHeader: {
    backgroundColor: '#F3F4F6',
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    padding: 5,
  },
  headerText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center'
  },
  // Footer area
  footerTable: {
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  signBox: {
    height: 90, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  bold: {
    fontFamily: 'Helvetica-Bold'
  }
});

const allChecklistItems = [
    "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", 
    "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
    "Dokumen Lingkungan", 
    "Peta (Siteplan, Tapak, Pengelolaan, Pemantauan) - Kertas A3", 
    "PKKPR / ITR",
    "NIB (Untuk Swasta atau Perorangan)", 
    "Fotocopy Status Lahan (Sertifikat / Letter C)", 
    "Fotocopy KTP Penanggungjawab Kegiatan",
    "Foto Eksisting Lokasi Disertai Titik Koordinat", 
    "Lembar Penapisan AMDALNET / Arahan Instansi",
    "Surat Kuasa (Bermaterai) - Jika dikuasakan", 
    "Perizinan yang Sudah Dimiliki / Izin Lama",
    "Pemenuhan Pertek Air Limbah*", 
    "Pemenuhan Rintek Limbah B3 Sementara*", 
    "Pemenuhan Pertek Emisi*",
    "Pemenuhan Pertek Andalalin*", 
    "Hasil Penapisan Kewajiban Pertek*",
    "Bukti Upload Permohonan pada AMDALNET"
];

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

export const ChecklistDocument = ({ data, checkedItems, statusBerkas }: any) => {
  // Base URL untuk menjamin logo muncul saat di-upload ke Drive via Vercel
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoSrc = `${baseUrl}/logo-sragen.png`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER LOGO & JUDUL (OPSIONAL KOP) */}
        <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center', borderBottom: 1, paddingBottom: 10 }}>
            <Image src={logoSrc} style={{ width: 35, height: 45, marginRight: 15 }} />
            <View>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>DINAS LINGKUNGAN HIDUP KABUPATEN SRAGEN</Text>
                <Text style={{ fontSize: 8 }}>Sistem Informasi Perizinan Lingkungan Hidup (SI-DLH)</Text>
            </View>
        </View>

        <Text style={styles.headerTitle}>
          CHECKLIST KELENGKAPAN BERKAS PERMOHONAN
        </Text>

        {/* TABEL INFO ATAS */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>Nama Kegiatan</Text></View>
              <View style={{ ...styles.tableCol, width: '75%' }}><Text style={{...styles.tableCell, ...styles.bold}}>{data.namaKegiatan?.toUpperCase()}</Text></View>
          </View>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>Pemrakarsa</Text></View>
              <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableCell}>{data.namaPemrakarsa}</Text></View>
          </View>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>No. Registrasi / Tgl</Text></View>
              <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableCell}>{data.nomorChecklist} / {formatDate(data.tanggalMasukDokumen)}</Text></View>
          </View>
        </View>

        {/* TABEL CHECKLIST UTAMA */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <View style={{ ...styles.tableColHeader, width: '8%' }}><Text style={styles.headerText}>No</Text></View>
              <View style={{ ...styles.tableColHeader, width: '77%' }}><Text style={styles.headerText}>Item Kelengkapan Berkas</Text></View>
              <View style={{ ...styles.tableColHeader, width: '15%' }}><Text style={styles.headerText}>Status</Text></View>
          </View>

          {allChecklistItems.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                  <View style={{ ...styles.tableCol, width: '8%' }}><Text style={{...styles.tableCell, textAlign: 'center'}}>{index + 1}</Text></View>
                  <View style={{ ...styles.tableCol, width: '77%' }}><Text style={styles.tableCell}>{item}</Text></View>
                  <View style={{ ...styles.tableCol, width: '15%' }}>
                      <Text style={{...styles.tableCell, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: checkedItems?.[item] ? 'black' : '#D1D5DB'}}>
                          {checkedItems?.[item] ? 'ADA' : '-'}
                      </Text>
                  </View>
              </View>
          ))}
        </View>

        {/* FOOTER & PENGESAHAN */}
        <View style={styles.footerTable}>
            <View style={styles.tableRow}>
                 <View style={{ ...styles.tableCol, width: '100%', backgroundColor: '#F3F4F6' }}>
                     <Text style={{...styles.tableCell, ...styles.bold}}>KESIMPULAN PEMERIKSAAN : {statusBerkas || 'DALAM PROSES'}</Text>
                 </View>
            </View>
            
            <View style={styles.tableRow}>
                {/* Kolom Kiri - Pemohon */}
                <View style={{ ...styles.tableCol, width: '50%', height: 120 }}>
                    <View style={styles.signBox}>
                        <Text style={{ fontSize: 8, marginBottom: 45 }}>Pemohon / Penyerah Berkas,</Text>
                        <Text style={{ ...styles.tableCell, ...styles.bold }}>({data.namaPengirim || data.namaPemrakarsa})</Text>
                    </View>
                </View>

                {/* Kolom Kanan - Petugas */}
                <View style={{ ...styles.tableCol, width: '50%', height: 120 }}>
                    <View style={styles.signBox}>
                        <Text style={{ fontSize: 8, marginBottom: 45 }}>Petugas Penerima (MPP/DLH),</Text>
                        <Text style={{ ...styles.tableCell, ...styles.bold }}>({data.namaPetugas || '....................'})</Text>
                    </View>
                </View>
            </View>
        </View>
        
        <Text style={{ fontSize: 7, marginTop: 10, fontStyle: 'italic', color: 'grey' }}>
            * Dokumen ini di-generate otomatis oleh SI-DLH Sragen pada {new Date().toLocaleString('id-ID')} dan sah sebagai arsip digital.
        </Text>

      </Page>
    </Document>
  );
};