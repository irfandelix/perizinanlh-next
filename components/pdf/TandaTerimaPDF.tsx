import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontFamily: 'Helvetica', 
    fontSize: 11, 
    lineHeight: 1.4 
  },
  
  // --- KOP SURAT STYLE ---
  kopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: -10
  },
  logoContainer: {
    width: '15%',
    paddingRight: 10,
    alignItems: 'center'
  },
  logo: {
    width: 60,
    height: 70, // Sesuaikan rasio logo Sragen
  },
  kopTextContainer: {
    width: '85%',
    alignItems: 'center',
    textAlign: 'center'
  },
  kopPemkab: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  kopDinas: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold', // Gunakan Bold bawaan
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  kopAlamat: {
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  kopKontak: {
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  
  // Garis Ganda (Double Line)
  garisGandaContainer: {
    marginBottom: 20,
    marginTop: 5,
  },
  garisTebal: {
    height: 3,
    backgroundColor: 'black',
  },
  garisTipis: {
    height: 1,
    backgroundColor: 'black',
    marginTop: 1,
  },

  // --- JUDUL & ISI ---
  judulContainer: { textAlign: 'center', marginBottom: 20 },
  judulH1: { 
    textDecoration: 'underline', 
    fontSize: 14, 
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold', 
    textTransform: 'uppercase'
  },
  judulP: { marginTop: 5, fontSize: 11 },
  
  isiTeks: { textAlign: 'justify', marginBottom: 20, lineHeight: 1.5 },
  bold: { fontFamily: 'Helvetica-Bold', fontWeight: 'bold' },
  
  // --- TANDA TANGAN ---
  ttdContainer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  ttdBox: { textAlign: 'center', width: 220 },
  ttdName: { 
    marginTop: 60, 
    borderBottomWidth: 1, 
    borderBottomColor: 'black', 
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    paddingBottom: 2 
  }
});

// Pastikan Anda menaruh file logo (format .png atau .jpg) di folder public project Anda
// Contoh: public/logo-sragen.png
const LOGO_URL = '/logo-sragen.png'; 

export const TandaTerimaPDF = ({ data }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* --- KOP SURAT RESMI --- */}
      <View style={styles.kopContainer}>
        {/* Kolom Logo */}
        <View style={styles.logoContainer}>
            {/* Ganti src dengan path logo Sragen Anda */}
            {/* Jika error di Vercel, gunakan URL absolut atau import gambar */}
            <Image src='/logo-sragen.png' style={styles.logo} /> 
        </View>
        
        {/* Kolom Teks Kop */}
        <View style={styles.kopTextContainer}>
          <Text style={styles.kopPemkab}>PEMERINTAH KABUPATEN SRAGEN</Text>
          <Text style={styles.kopDinas}>DINAS LINGKUNGAN HIDUP</Text>
          <Text style={styles.kopAlamat}>
            Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214
          </Text>
          <Text style={styles.kopKontak}>
            Telepon (0271) 891136, Faksimile (0271) 891136, Laman www.dlh.sragenkab.go.id
          </Text>
          <Text style={styles.kopKontak}>Pos-el dlh.sragenkab.go.id</Text>
        </View>
      </View>

      {/* Garis Ganda Pembatas Kop */}
      <View style={styles.garisGandaContainer}>
         <View style={styles.garisTebal} />
         <View style={styles.garisTipis} />
      </View>

      {/* --- JUDUL & NOMOR REGISTRASI --- */}
      <View style={styles.judulContainer}>
        <Text style={styles.judulH1}>TANDA TERIMA DOKUMEN</Text>
        <Text style={styles.judulP}>
          Nomor Registrasi: <Text style={styles.bold}>{data.nomorChecklist || "________"}</Text>
        </Text>
      </View>

      {/* --- ISI TEKS --- */}
      <View style={styles.isiTeks}>
        <Text>
          Pada tanggal <Text style={styles.bold}>{data.tanggalMasukDokumen || "-"}</Text> telah menerima Dokumen{" "}
          <Text style={styles.bold}>{data.jenisDokumen} - {data.namaKegiatan}</Text> oleh{" "}
          <Text style={styles.bold}>{data.namaPengirim || data.namaPemrakarsa}</Text> sebagai{" "}
          <Text style={styles.bold}>{data.pengirimSebagai}</Text>. Dokumen tersebut telah diterima dalam keadaan baik melalui Gerai MPP.
        </Text>
      </View>

      {/* --- TANDA TANGAN --- */}
      <View style={styles.ttdContainer}>
        <View style={styles.ttdBox}>
          <Text>Yang Menyerahkan,</Text>
          <Text style={styles.ttdName}>{data.namaPengirim || "......................"}</Text>
        </View>
        <View style={styles.ttdBox}>
          <Text>Petugas Penerima,</Text>
          <Text style={styles.ttdName}>{data.namaPetugas || "......................"}</Text>
        </View>
      </View>

    </Page>
  </Document>
);