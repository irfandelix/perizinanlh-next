'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Catatan: Di React-PDF, font 'Helvetica' adalah font standar yang tampilan (typeface)-nya sama dengan Arial.
// Tidak perlu Font.register untuk Helvetica karena sudah bawaan library.

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 11, // UKURAN BODY 11
    fontFamily: 'Helvetica', // PENGGANTI ARIAL
    lineHeight: 1.3,
  },
  
  // --- KOP SURAT ---
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 3, 
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
    marginBottom: 2, 
  },
  headerLine2: {
    borderBottomWidth: 1, 
    borderBottomColor: '#000',
    marginBottom: 20,
  },
  logo: {
    width: 65,
    height: 75,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerText1: {
    fontSize: 12, // Nama Pemkab sedikit lebih besar dari alamat
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
    fontWeight: 'normal',
  },
  headerText2: {
    fontSize: 14, // Nama Dinas lebih tebal/besar
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerAddress: {
    fontSize: 10, // UKURAN KOP (ALAMAT) 10
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Helvetica',
  },
  
  // --- JUDUL ---
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold', // Arial Bold
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginTop: 5,
    marginBottom: 20,
  },

  // --- ISI DATA ---
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelCol: {
    width: '35%',
    fontSize: 11, // Body 11
  },
  separatorCol: {
    width: '3%',
    textAlign: 'center',
    fontSize: 11,
  },
  valueCol: {
    width: '62%',
    fontFamily: 'Helvetica-Bold', // Isian ditebalkan
    fontSize: 11,
  },

  // --- PARAGRAF ---
  paragraph: {
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'justify',
    textIndent: 0, 
    lineHeight: 1.5,
    fontSize: 11, // Body 11
  },

  // --- TANDA TANGAN ---
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureName: {
    marginTop: 60, 
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    fontSize: 11,
  },
  signatureText: {
    fontSize: 11,
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique', // Arial Italic
    color: 'grey',
    textAlign: 'center',
  }
});

const formatDate = (dateString: any) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const TandaTerimaPDF_PHP = ({ data }: any) => {
  
  // 1. DATA DINAMIS
  const nomorSuratFinal = data.nomorSurat || data.nomorPHP || '-';
  const tanggalFinal = data.tanggalTerima || data.tanggalPenyerahanPerbaikan || data.tanggalPHP;
  const petugasFinal = data.petugas || data.petugasPenerimaPerbaikan;

  // 2. LOGIKA MAPPING LABEL (HARDCODED)
  const getLabelSurat = () => {
      const jenis = data.phpKe || 'PHP Ke-1'; 

      const mapLabels: Record<string, string> = {
          'PHP Ke-1': 'Nomor PHP (Revisi)',
          'PHP Ke-2': 'Nomor PHP 1 (Revisi)',
          'PHP Ke-3': 'Nomor PHP 2 (Revisi)',
          'PHP Ke-4': 'Nomor PHP 3 (Revisi)',
          'PHP Ke-5': 'Nomor PHP 4 (Revisi)',
      };

      return mapLabels[jenis] || 'Nomor PHP (Revisi)';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* KOP SURAT */}
        <View style={styles.headerContainer}>
            {/* Pastikan file logo ada di public/logo_sragen.png */}
            <Image style={styles.logo} src="public/logo-sragen.png" /> 
            
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerText1}>PEMERINTAH KABUPATEN SRAGEN</Text>
                <Text style={styles.headerText2}>DINAS LINGKUNGAN HIDUP</Text>
                <Text style={styles.headerAddress}>Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214</Text>
                <Text style={styles.headerAddress}>Telepon (0271) 891136, Faksimile (0271) 891136, Laman www.dlh.sragenkab.go.id</Text>
                <Text style={styles.headerAddress}>Pos-el dlh.sragenkab.go.id</Text>
            </View>
        </View>
        <View style={styles.headerLine2} />

        {/* JUDUL */}
        <Text style={styles.title}>
          TANDA TERIMA PERBAIKAN DOKUMEN (PHP)
        </Text>

        {/* ISI DATA */}
        <View>
            <View style={styles.row}>
                <Text style={styles.labelCol}>Nomor Registrasi</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{data.nomorChecklist || data.nomorRegistrasi}</Text>
            </View>

            {/* LABEL DINAMIS */}
            <View style={styles.row}>
                <Text style={styles.labelCol}>{getLabelSurat()}</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{nomorSuratFinal}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.labelCol}>Tanggal Penyerahan</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{formatDate(tanggalFinal)}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.labelCol}>Nama Kegiatan</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{data.namaKegiatan}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.labelCol}>Pemrakarsa</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{data.namaPemrakarsa}</Text>
            </View>
        </View>

        {/* PARAGRAF */}
        <Text style={styles.paragraph}>
            Telah diterima dokumen perbaikan (Revisi) atas kegiatan tersebut di atas. Dokumen ini telah diverifikasi kelengkapannya dan akan diproses lebih lanjut sesuai dengan Standar Operasional Prosedur (SOP) yang berlaku pada Dinas Lingkungan Hidup Kabupaten Sragen.
        </Text>

        {/* TANDA TANGAN */}
        <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>Yang Menyerahkan</Text>
                <Text style={styles.signatureText}>(Pemrakarsa / Konsultan)</Text>
                
                <Text style={styles.signatureName}>({data.namaPengirim || '....................'})</Text>
            </View>

            <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>Petugas Penerima</Text>
                <Text style={styles.signatureText}>Dinas Lingkungan Hidup</Text>
                
                <Text style={styles.signatureName}>({petugasFinal || '....................'})</Text>
            </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
            *Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Perizinan Lingkungan Hidup Kab. Sragen.
        </Text>

      </Page>
    </Document>
  );
};