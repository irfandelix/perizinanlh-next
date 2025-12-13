import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

const allChecklistItems = [
    "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
    "Dokumen Lingkungan", "Peta / Siteplan (A3)", "PKKPR", "NIB", "Status Lahan (Sertifikat)", 
    "KTP Penanggungjawab", "Foto Eksisting Lokasi", "Lembar Penapisan AMDALNET", "Surat Kuasa (Bermaterai)", 
    "Izin Lama (Jika Ada)", "Persetujuan Teknis Air Limbah*", "Rincian Teknis Limbah B3*", 
    "Persetujuan Teknis Emisi*", "Persetujuan Teknis Andalalin*", "Hasil Penapisan Peryek*", "Bukti Upload AMDALNET"
];

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9 },
    header: { textAlign: 'center', marginBottom: 15 },
    title: { fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' },
    subtitle: { fontSize: 10, marginTop: 4 },
    infoBox: { borderTop: 1, borderLeft: 1, borderColor: '#000', marginBottom: 10 },
    row: { flexDirection: 'row' },
    label: { width: '30%', padding: 4, borderRight: 1, borderBottom: 1, backgroundColor: '#f3f4f6' },
    sep: { width: '2%', padding: 4, borderRight: 1, borderBottom: 1, textAlign: 'center' },
    val: { width: '68%', padding: 4, borderRight: 1, borderBottom: 1, fontWeight: 'bold' },
    table: { borderTop: 1, borderLeft: 1, borderColor: '#000' },
    cell: { borderRight: 1, borderBottom: 1, padding: 4 },
    headerCell: { backgroundColor: '#e5e7eb', fontWeight: 'bold', textAlign: 'center' },
    c1: { width: '6%', textAlign: 'center' }, c2: { width: '59%' }, c3: { width: '15%', textAlign: 'center' }, c4: { width: '20%' },
    footer: { marginTop: 15, borderTop: 1, borderLeft: 1 },
    ftRow: { flexDirection: 'row' },
    ftCap: { width: '40%', height: 70, borderRight: 1, borderBottom: 1, justifyContent: 'center', textAlign: 'center', color: '#888' },
    ftRight: { width: '60%' },
    ftStatus: { padding: 5, textAlign: 'center', fontWeight: 'bold', borderRight: 1, borderBottom: 1, backgroundColor: '#f3f4f6' },
    ftSignBox: { flexDirection: 'row', height: 45 },
    ftSign: { width: '50%', borderRight: 1, borderBottom: 1, padding: 4, justifyContent: 'flex-end', textAlign: 'center' }
});

export const ChecklistPrintTemplate = ({ data, checklistStatus, statusVerifikasi }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
        <View style={styles.header}>
            <Text style={styles.title}>CHECKLIST KELENGKAPAN BERKAS</Text>
            <Text style={styles.subtitle}>PERMOHONAN PERSETUJUAN LINGKUNGAN</Text>
        </View>
        <View style={styles.infoBox}>
            <View style={styles.row}><Text style={styles.label}>Kegiatan</Text><Text style={styles.sep}>:</Text><Text style={styles.val}>{data.namaKegiatan}</Text></View>
            <View style={styles.row}><Text style={styles.label}>No. Surat</Text><Text style={styles.sep}>:</Text><Text style={styles.val}>{data.nomorSuratPermohonan}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Tanggal</Text><Text style={styles.sep}>:</Text><Text style={styles.val}>{formatDate(data.tanggalMasukDokumen)}</Text></View>
        </View>
        <View style={styles.table}>
            <View style={styles.row} fixed>
                <Text style={[styles.cell, styles.headerCell, styles.c1]}>No</Text><Text style={[styles.cell, styles.headerCell, styles.c2]}>Dokumen</Text>
                <Text style={[styles.cell, styles.headerCell, styles.c3]}>Ada</Text><Text style={[styles.cell, styles.headerCell, styles.c4]}>Ket</Text>
            </View>
            {allChecklistItems.map((item, i) => (
                <View style={styles.row} key={i}>
                    <Text style={[styles.cell, styles.c1]}>{i + 1}</Text><Text style={[styles.cell, styles.c2]}>{item}</Text>
                    <Text style={[styles.cell, styles.c3, { color: checklistStatus[i] ? 'green' : 'red', fontWeight: 'bold' }]}>{checklistStatus[i] ? 'V' : ''}</Text>
                    <Text style={[styles.cell, styles.c4]}></Text>
                </View>
            ))}
        </View>
        <View style={styles.footer}>
            <View style={styles.ftRow}>
                <View style={styles.ftCap}><Text>(Cap Dinas)</Text></View>
                <View style={styles.ftRight}>
                    <Text style={styles.ftStatus}>Status: {statusVerifikasi?.toUpperCase()}</Text>
                    <View style={styles.ftSignBox}>
                        <View style={styles.ftSign}><Text style={{fontSize:8}}>Penyerah</Text><Text style={{fontWeight:'bold'}}>{data.namaPengirim}</Text></View>
                        <View style={styles.ftSign}><Text style={{fontSize:8}}>Penerima</Text><Text style={{fontWeight:'bold'}}>{data.namaPetugas}</Text></View>
                    </View>
                </View>
            </View>
        </View>
    </Page>
  </Document>
);