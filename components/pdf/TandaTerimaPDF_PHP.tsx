'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  
  // --- KOP SURAT ---
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2, 
    borderBottomColor: '#000',
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
    marginRight: 60, // Menyeimbangkan offset logo agar teks tetap di tengah
  },
  headerText1: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    textTransform: 'uppercase',
  },
  headerText2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerAddress: {
    fontSize: 8.5,
    textAlign: 'center',
    marginTop: 1,
    fontFamily: 'Helvetica',
  },
  
  // --- JUDUL ---
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 25,
  },

  // --- ISI DATA ---
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
    fontFamily: 'Helvetica-Bold',
  },

  // --- PARAGRAF ---
  paragraph: {
    marginTop: 15,
    marginBottom: 30,
    textAlign: 'justify',
    lineHeight: 1.6,
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
    textAlign: 'center',
  },
  signatureName: {
    marginTop: 55, 
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 7,
    fontFamily: 'Helvetica-Oblique',
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

export const TandaTerimaPDF_PHP = ({ data }: { data: any }) => {
  
  // URL Logo dinamis agar aman saat proses Generate & Upload ke Drive
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoSrc = `${baseUrl}/logo-sragen.png`;

  // 1. DATA DINAMIS
  const nomorSuratFinal = data.nomorSurat || data.nomorPHP || '-';
  const tanggalFinal = data.tanggalPHP || data.tanggalPenyerahanPerbaikan || data.tanggalTerima;
  const petugasFinal = data.petugasPenerimaPerbaikan || data.petugas || 'Petugas DLH';

  // 2. LOGIKA MAPPING LABEL
  const getLabelSurat = () => {
      const phpKe = String(data.nomorRevisi || data.phpKe || '1');
      if (phpKe.includes('2')) return "Nomor PHP 1 (Revisi)";
      if (phpKe.includes('3')) return "Nomor PHP 2 (Revisi)";
      if (phpKe.includes('4')) return "Nomor PHP 3 (Revisi)";
      if (phpKe.includes('5')) return "Nomor PHP 4 (Revisi)";
      return "Nomor PHP";
  };

  return (
    <Document title={`Tanda Terima PHP - ${data.namaPemrakarsa}`}>
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
            Telah diterima dokumen hasil perbaikan (Revisi) atas rencana usaha dan/atau kegiatan tersebut di atas. Dokumen ini telah diverifikasi kelengkapannya secara administratif dan akan diproses lebih lanjut sesuai dengan ketentuan yang berlaku. Tanda terima ini sah dan dicetak secara otomatis melalui Sistem Informasi DLH Sragen.
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

        {/* FOOTER ARSIP DIGITAL */}
        <View style={styles.footer}>
            <Text>*Dokumen ini di-generate otomatis untuk keperluan arsip digital SI-DLH Sragen.</Text>
            <Text>Waktu Cetak: {new Date().toLocaleString('id-ID')} WIB</Text>
        </View>

      </Page>
    </Document>
  );
};