'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// --- REGISTER FONT (Times New Roman untuk Kesan Formal Dinas) ---
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

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.3,
  },
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2, 
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
    marginBottom: 1, 
  },
  headerLine2: {
    borderBottomWidth: 1, 
    borderBottomColor: '#000',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 75,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 60, // Offset balancing logo
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
    fontSize: 8,
    textAlign: 'center',
    marginTop: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 20,
  },
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
    fontFamily: 'Times-Bold', 
  },
  paragraph: {
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
    textAlign: 'center',
  },
  signatureName: {
    marginTop: 55, 
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 7,
    fontFamily: 'Times-Italic',
    color: 'grey',
    textAlign: 'center',
  }
});

const formatDate = (dateString: any) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const TahapFDocument = ({ data }: { data: any }) => {
  
  // URL Logo dinamis agar aman di Drive Upload & Browser
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoSrc = `${baseUrl}/logo-sragen.png`;

  // Mapping data agar fleksibel menerima berbagai nama variabel dari DB
  const nomorSuratFinal = data.nomorSurat || data.nomorPHP || '-';
  const tanggalFinal = data.tanggalPHP || data.tanggalPenyerahanPerbaikan || data.tanggalTerima;
  const petugasFinal = data.petugasPenerimaPerbaikan || data.petugas || 'Petugas DLH';

  // Logika Label Revisi Otomatis
  const getLabelSurat = () => {
      const phpKe = String(data.nomorRevisi || data.phpKe || '1');
      if (phpKe.includes('2')) return "Nomor PHP 1 (Revisi)";
      if (phpKe.includes('3')) return "Nomor PHP 2 (Revisi)";
      if (phpKe.includes('4')) return "Nomor PHP 3 (Revisi)";
      if (phpKe.includes('5')) return "Nomor PHP 4 (Revisi)";
      return "Nomor PHP";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* KOP SURAT */}
        <View style={styles.headerContainer}>
            <Image style={styles.logo} src={logoSrc} /> 
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerText1}>PEMERINTAH KABUPATEN SRAGEN</Text>
                <Text style={styles.headerText2}>DINAS LINGKUNGAN HIDUP</Text>
                <Text style={styles.headerAddress}>Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214</Text>
                <Text style={styles.headerAddress}>Telepon (0271) 891136, Laman: www.dlh.sragenkab.go.id</Text>
            </View>
        </View>
        <View style={styles.headerLine2} />

        {/* JUDUL */}
        <Text style={styles.title}>
          TANDA TERIMA PERBAIKAN DOKUMEN (PHP)
        </Text>

        {/* ISI DATA UTAMA */}
        <View>
            <View style={styles.row}>
                <Text style={styles.labelCol}>Nomor Registrasi</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{data.nomorChecklist || data.nomorRegistrasi || '-'}</Text>
            </View>

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
                <Text style={styles.valueCol}>{data.namaKegiatan?.toUpperCase() || '-'}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.labelCol}>Pemrakarsa</Text>
                <Text style={styles.separatorCol}>:</Text>
                <Text style={styles.valueCol}>{data.namaPemrakarsa || '-'}</Text>
            </View>
        </View>

        {/* PARAGRAF KETERANGAN */}
        <Text style={styles.paragraph}>
            Telah diterima dokumen hasil perbaikan (Revisi) atas rencana usaha dan/atau kegiatan tersebut di atas. Dokumen ini akan dilakukan pemeriksaan akhir untuk kemudian diterbitkan Risalah Pengolahan Data (RPD) atau Persetujuan Lingkungan. Tanda terima ini dicetak secara otomatis dan berfungsi sebagai bukti penyerahan berkas yang sah.
        </Text>

        {/* TANDA TANGAN */}
        <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
                <Text>Yang Menyerahkan,</Text>
                <Text style={{fontSize: 9}}>(Pemrakarsa / Konsultan)</Text>
                <Text style={styles.signatureName}>{data.namaPengirim || data.namaPemrakarsa || '....................'}</Text>
            </View>

            <View style={styles.signatureBox}>
                <Text>Petugas Penerima,</Text>
                <Text style={{fontSize: 9}}>Dinas Lingkungan Hidup</Text>
                <Text style={styles.signatureName}>{petugasFinal}</Text>
            </View>
        </View>

        {/* FOOTER & TIMESTAMP (ARSIP DIGITAL) */}
        <View style={styles.footer}>
            <Text>*Dokumen ini diterbitkan secara elektronik oleh SI-DLH Kab. Sragen.</Text>
            <Text>Dicetak pada: {new Date().toLocaleString('id-ID')}</Text>
        </View>

      </Page>
    </Document>
  );
};