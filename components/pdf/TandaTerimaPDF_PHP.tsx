'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// --- REGISTER FONT (WAJIB ADA) ---
Font.register({
  family: 'Times-Roman',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPSMT.ttf'
});
Font.register({
  family: 'Times-Bold',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-BoldMT.ttf'
});
Font.register({
  family: 'Times-Italic',
  src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-ItalicMT.ttf'
});

// --- STYLES SURAT RESMI ---
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.3,
  },
  // KOP SURAT
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 3, 
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
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
    fontSize: 14,
    fontFamily: 'Times-Roman',
    textTransform: 'uppercase',
  },
  headerText2: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerAddress: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  
  // JUDUL
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 20,
  },

  // DATA ROW (Tanpa Border)
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelCol: {
    width: '35%',
  },
  separatorCol: {
    width: '3%',
    textAlign: 'center',
  },
  valueCol: {
    width: '62%',
    fontFamily: 'Times-Bold', // Data Bold
  },

  // PARAGRAF
  paragraph: {
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'justify',
    textIndent: 0, 
    lineHeight: 1.5,
  },

  // TTD
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
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
  },

  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    fontFamily: 'Times-Italic',
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
  
  // 1. DATA DINAMIS (Mengambil data spesifik revisi)
  const nomorSuratFinal = data.nomorSurat || data.nomorPHP || '-';
  const tanggalFinal = data.tanggalTerima || data.tanggalPenyerahanPerbaikan || data.tanggalPHP;
  const petugasFinal = data.petugas || data.petugasPenerimaPerbaikan;

  // 2. LOGIKA MAPPING LABEL (HARDCODED AGAR PASTI BENAR)
  const getLabelSurat = () => {
      // String ini dikirim dari Frontend (renderPHPRow)
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
            {/* PASTIKAN LOGO ADA DI FOLDER PUBLIC */}
            <Image style={styles.logo} src="/logo_sragen.png" /> 
            
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
                <Text>Yang Menyerahkan</Text>
                <Text>(Pemrakarsa / Konsultan)</Text>
                
                <Text style={styles.signatureName}>({data.namaPengirim || '....................'})</Text>
            </View>

            <View style={styles.signatureBox}>
                <Text>Petugas Penerima</Text>
                <Text>Dinas Lingkungan Hidup</Text>
                
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