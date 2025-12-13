import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  kopContainer: { borderBottomWidth: 2, borderBottomColor: 'black', borderBottomStyle: 'solid', paddingBottom: 10, marginBottom: 20, textAlign: 'center' },
  kopH4: { fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold' },
  kopH2: { fontSize: 18, textTransform: 'uppercase', fontWeight: 'bold', marginTop: 3 },
  kopP: { fontSize: 9, marginTop: 2 },
  judulContainer: { textAlign: 'center', marginBottom: 20 },
  judulH1: { textDecoration: 'underline', fontSize: 14, fontWeight: 'bold' },
  judulP: { marginTop: 5, fontSize: 10 },
  table: { width: '100%', marginTop: 10 }, 
  tableRow: { flexDirection: 'row', marginBottom: 4 },
  tableColLabel: { width: '25%' },
  tableColSeparator: { width: '2%' },
  tableColValue: { width: '73%' },
  ttdContainer: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  ttdBox: { textAlign: 'center', width: 200 },
  ttdName: { borderBottomWidth: 1, borderBottomColor: 'black', fontWeight: 'bold', paddingTop: 40 }
});

export const TandaTerimaPDF = ({ data }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.kopContainer}>
        <Text style={styles.kopH4}>Pemerintah Kabupaten Sragen</Text>
        <Text style={styles.kopH2}>Dinas Lingkungan Hidup</Text>
        <Text style={styles.kopP}>Jl. Raya Sukowati No. 20, Sragen, Jawa Tengah</Text>
      </View>
      <View style={styles.judulContainer}>
        <Text style={styles.judulH1}>TANDA TERIMA DOKUMEN</Text>
        <Text style={styles.judulP}>Nomor Registrasi: <Text style={{ fontWeight: 'bold' }}>{data.nomorChecklist || "________"}</Text></Text>
      </View>
      <Text style={{ marginBottom: 10 }}>Telah diterima berkas dokumen pada tanggal <Text style={{ fontWeight: 'bold' }}>{data.tanggalMasukDokumen}</Text>:</Text>
      <View style={styles.table}>
          <View style={styles.tableRow}><Text style={styles.tableColLabel}>1. Nama Pemrakarsa</Text><Text style={styles.tableColSeparator}>:</Text><Text style={styles.tableColValue}>{data.namaPemrakarsa}</Text></View>
          <View style={styles.tableRow}><Text style={styles.tableColLabel}>2. Judul Kegiatan</Text><Text style={styles.tableColSeparator}>:</Text><Text style={styles.tableColValue}>{data.namaKegiatan}</Text></View>
          <View style={styles.tableRow}><Text style={styles.tableColLabel}>3. Lokasi</Text><Text style={styles.tableColSeparator}>:</Text><Text style={styles.tableColValue}>{data.lokasiKegiatan}</Text></View>
          <View style={styles.tableRow}><Text style={styles.tableColLabel}>4. Jenis Dokumen</Text><Text style={styles.tableColSeparator}>:</Text><Text style={styles.tableColValue}>{data.jenisDokumen}</Text></View>
      </View>
      <View style={styles.ttdContainer}>
          <View style={styles.ttdBox}><Text>Yang Menyerahkan,</Text><Text style={styles.ttdName}>{data.namaPengirim || '......................'}</Text></View>
          <View style={styles.ttdBox}><Text>Petugas Penerima,</Text><Text style={styles.ttdName}>{data.namaPetugas || '......................'}</Text></View>
      </View>
    </Page>
  </Document>
);