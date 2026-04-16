'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 40, // Memberikan margin yang cukup untuk printer dinas
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    lineHeight: 1.5 
  },
  
  // --- KOP SURAT ---
  kopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logo: {
    width: 55,
    height: 70,
    marginRight: 15,
  },
  kopTextContainer: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    marginRight: 55, // Balancing offset karena logo berada di kiri
  },
  kopPemkab: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
  },
  kopDinas: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  kopAlamat: {
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  garisTebal: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    marginTop: 5,
  },
  garisTipis: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginTop: 2,
    marginBottom: 20,
  },

  // --- JUDUL ---
  judulContainer: { textAlign: 'center', marginBottom: 25 },
  judulH1: { 
    textDecoration: 'underline', 
    fontSize: 13, 
    fontFamily: 'Helvetica-Bold', 
    textTransform: 'uppercase'
  },
  judulP: { marginTop: 5, fontSize: 10 },
  
  // --- KONTEN DATA ---
  isiTeks: { textAlign: 'justify', marginBottom: 20 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: 120 },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },
  bold: { fontFamily: 'Helvetica-Bold' },
  
  // --- TANDA TANGAN ---
  ttdContainer: { 
    marginTop: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  ttdBox: { 
    textAlign: 'center', 
    width: 200 
  },
  ttdLabel: { marginBottom: 50 },
  ttdName: { 
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase'
  },

  // --- FOOTER ARSIP ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: 'grey',
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#EEEEEE',
    paddingTop: 5
  }
});

export const TandaTerimaPDF = ({ data }: { data: any }) => {
  // Logic untuk memastikan logo terload baik di Local maupun Vercel saat upload Drive
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoSrc = `${baseUrl}/logo-sragen.png`;

  return (
    <Document title={`Tanda Terima - ${data.namaPemrakarsa}`}>
      <Page size="A4" style={styles.page}>
        
        {/* --- KOP SURAT --- */}
        <View style={styles.kopContainer}>
          <Image src={logoSrc} style={styles.logo} /> 
          <View style={styles.kopTextContainer}>
            <Text style={styles.kopPemkab}>PEMERINTAH KABUPATEN SRAGEN</Text>
            <Text style={styles.kopDinas}>DINAS LINGKUNGAN HIDUP</Text>
            <Text style={styles.kopAlamat}>
              Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214
            </Text>
            <Text style={styles.kopAlamat}>
              Telepon (0271) 891136, Laman: www.dlh.sragenkab.go.id
            </Text>
          </View>
        </View>
        <View style={styles.garisTebal} />
        <View style={styles.garisTipis} />

        {/* --- JUDUL --- */}
        <View style={styles.judulContainer}>
          <Text style={styles.judulH1}>TANDA TERIMA BERKAS DOKUMEN</Text>
          <Text style={styles.judulP}>
            Nomor Registrasi: <Text style={styles.bold}>{data.nomorChecklist || "-"}</Text>
          </Text>
        </View>

        {/* --- ISI DATA --- */}
        <View style={styles.isiTeks}>
          <Text style={{ marginBottom: 10 }}>
            Telah diterima berkas permohonan persetujuan lingkungan dengan rincian sebagai berikut:
          </Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Nama Kegiatan</Text>
            <Text style={styles.value}>: {data.namaKegiatan?.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jenis Dokumen</Text>
            <Text style={styles.value}>: {data.jenisDokumen}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pemrakarsa</Text>
            <Text style={styles.value}>: {data.namaPemrakarsa}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Masuk</Text>
            <Text style={styles.value}>: {data.tanggalMasukDokumen}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nama Pengirim</Text>
            <Text style={styles.value}>: {data.namaPengirim || "-"}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, fontStyle: 'italic', marginTop: 10, textAlign: 'justify' }}>
          Dokumen ini merupakan bukti sah penerimaan berkas untuk dilanjutkan ke tahap verifikasi administrasi dan validasi lapangan oleh Tim Teknis Dinas Lingkungan Hidup Kabupaten Sragen.
        </Text>

        {/* --- TANDA TANGAN --- */}
        <View style={styles.ttdContainer}>
          <View style={styles.ttdBox}>
            <Text style={styles.ttdLabel}>Yang Menyerahkan,</Text>
            <Text style={styles.ttdName}>{data.namaPengirim || data.namaPemrakarsa || "......................"}</Text>
          </View>
          <View style={styles.ttdBox}>
            <Text style={styles.ttdLabel}>Petugas Penerima,</Text>
            <Text style={styles.ttdName}>{data.namaPetugas || "......................"}</Text>
          </View>
        </View>

        {/* --- FOOTER OTOMATIS --- */}
        <View style={styles.footer}>
          <Text>Dokumen ini dihasilkan secara otomatis oleh SI-DLH Sragen.</Text>
          <Text>Waktu Pengarsipan Digital: {new Date().toLocaleString('id-ID')} WIB</Text>
        </View>

      </Page>
    </Document>
  );
};