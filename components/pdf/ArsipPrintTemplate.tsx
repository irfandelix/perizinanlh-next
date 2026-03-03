import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLING PDF (Flexbox & Formal) ---
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        fontSize: 10, 
        fontFamily: 'Helvetica',
        color: '#000' 
    },
    // KOP SURAT DETAIL (Disesuaikan dengan permintaanmu)
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    logo: {
        width: 60,
        height: 75,
        marginRight: 10,
    },
    headerTextContainer: {
        flex: 1,
        textAlign: 'center',
        marginRight: 60, // Menyeimbangkan posisi teks karena ada logo di kiri
    },
    headerText1: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        marginBottom: 2
    },
    headerText2: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 4
    },
    headerAddress: { 
        fontSize: 8, 
        marginBottom: 1
    },
    headerLine2: {
        borderBottomWidth: 3,
        borderBottomColor: '#000',
        marginTop: 2,
        marginBottom: 15,
    },

    // BOX INFORMASI (Identik dengan Lembar Registrasi)
    regBox: { 
        borderWidth: 1, 
        borderColor: '#000', 
        padding: 12, 
        marginBottom: 15, 
        borderRadius: 2 
    },
    regTitle: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
        textDecoration: 'underline'
    },
    infoRow: { 
        flexDirection: 'row', 
        marginBottom: 4 
    },
    label: { 
        width: 120, 
        fontSize: 9,
        fontWeight: 'bold'
    },
    value: { 
        flex: 1,
        fontSize: 9
    },

    // TABEL ARSIP (11 ITEM)
    table: { 
        display: 'flex', 
        flexDirection: 'column', 
        width: 'auto', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderRightWidth: 0, 
        borderBottomWidth: 0 
    },
    tableRow: { 
        flexDirection: 'row',
        minHeight: 22,
        alignItems: 'center'
    },
    tableHeader: { 
        backgroundColor: '#f1f5f9', 
        fontWeight: 'bold' 
    },
    tableColNo: { 
        width: '7%', 
        borderRightWidth: 1, 
        borderBottomWidth: 1, 
        padding: 4, 
        textAlign: 'center' 
    },
    tableColLabel: { 
        width: '43%', 
        borderRightWidth: 1, 
        borderBottomWidth: 1, 
        padding: 4 
    },
    tableColNoDok: { 
        width: '35%', 
        borderRightWidth: 1, 
        borderBottomWidth: 1, 
        padding: 4,
        fontSize: 8
    },
    tableColStatus: { 
        width: '15%', 
        borderRightWidth: 1, 
        borderBottomWidth: 1, 
        padding: 4, 
        textAlign: 'center',
        fontSize: 8
    },

    // TANDA TANGAN
    footer: { 
        marginTop: 30, 
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    signatureContainer: {
        width: 200,
        textAlign: 'center'
    },
    signatureSpace: { 
        marginTop: 50, 
        fontWeight: 'bold',
        textDecoration: 'underline'
    }
});

// --- KOMPONEN PRINT ---
export const ArsipPrintTemplate = ({ data, arsipFisik }: any) => {
    // 11 Item Arsip/route.ts]
    const items = [
        { id: 1, label: 'Dokumen Lingkungan Cetak', status: arsipFisik?.dokumenCetak, no: arsipFisik?.noDokumenCetak },
        { id: 2, label: 'PKPLH Arsip', status: arsipFisik?.pkplhArsip, no: arsipFisik?.noPkplhArsip },
        { id: 3, label: 'Uji Administrasi', status: !!data.nomorUjiBerkas, no: data.nomorUjiBerkas },
        { id: 4, label: 'BA Verlap', status: !!data.nomorBAVerlap, no: data.nomorBAVerlap },
        { id: 5, label: 'BA Pemeriksa / Sidang / Revisi', status: !!data.nomorBAPemeriksaan, no: data.nomorBAPemeriksaan },
        { id: 6, label: 'Surat Permohonan (Awal)', status: arsipFisik?.suratPermohonan, no: arsipFisik?.noSuratPermohonan },
        { id: 7, label: 'Lembar Registrasi', status: !!data.nomorChecklist, no: data.nomorChecklist },
        { id: 8, label: 'Lembar Pengembalian', status: !!data.tanggalPengembalian, no: data.tanggalPengembalian },
        { id: 9, label: 'Lembar Penerimaan Hasil Perbaikan (PHP)', status: !!data.nomorPHP, no: data.nomorPHP },
        { id: 10, label: 'Undangan Sidang', status: arsipFisik?.undanganSidang, no: arsipFisik?.noUndanganSidang },
        { id: 11, label: 'RPD (Risalah Pengolah Data)', status: !!data.nomorRisalah, no: data.nomorRisalah },
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* KOP SURAT RESMI */}
                <View style={styles.headerContainer}>
                    <Image style={styles.logo} src="/logo-sragen.png" /> 
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerText1}>PEMERINTAH KABUPATEN SRAGEN</Text>
                        <Text style={styles.headerText2}>DINAS LINGKUNGAN HIDUP</Text>
                        <Text style={styles.headerAddress}>Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214</Text>
                        <Text style={styles.headerAddress}>Telepon (0271) 891136, Faksimile (0271) 891136, Laman www.dlh.sragenkab.go.id</Text>
                        <Text style={styles.headerAddress}>Pos-el dlh.sragenkab.go.id</Text>
                    </View>
                </View>
                <View style={styles.headerLine2} />

                {/* JUDUL & INFORMASI (Mirip Lembar Registrasi) */}
                <View style={styles.regBox}>
                    <Text style={styles.regTitle}>LEMBAR KONTROL PENGARSIPAN DOKUMEN</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>NAMA KEGIATAN</Text>
                        <Text style={styles.value}>: {data.namaKegiatan?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>PEMRAKARSA</Text>
                        <Text style={styles.value}>: {data.namaPemrakarsa}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>NOMOR REGISTRASI</Text>
                        <Text style={styles.value}>: {data.nomorChecklist}</Text>
                    </View>
                </View>

                {/* TABEL KELENGKAPAN */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableColNo}>NO</Text>
                        <Text style={styles.tableColLabel}>NAMA DOKUMEN / ITEM ARSIP</Text>
                        <Text style={styles.tableColNoDok}>NOMOR SURAT / KETERANGAN</Text>
                        <Text style={styles.tableColStatus}>STATUS</Text>
                    </View>

                    {items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableColNo}>{item.id}</Text>
                            <Text style={styles.tableColLabel}>{item.label}</Text>
                            <Text style={styles.tableColNoDok}>{item.no || '-'}</Text>
                            <Text style={[styles.tableColStatus, { color: item.status ? 'green' : 'red', fontWeight: 'bold' }]}>
                                {item.status ? 'LENGKAP' : 'TIDAK ADA'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* TANDA TANGAN */}
                <View style={styles.footer}>
                    <View style={styles.signatureContainer}>
                        <Text>Sragen, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                        <Text style={{ marginTop: 2 }}>Petugas Arsip DLH,</Text>
                        <Text style={styles.signatureSpace}>( __________________________ )</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};