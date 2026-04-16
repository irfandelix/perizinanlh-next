'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLING PDF (Flexbox & Formal Dinas) ---
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        fontSize: 9, 
        fontFamily: 'Helvetica',
        color: '#000',
        lineHeight: 1.3
    },
    // KOP SURAT
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 5,
        marginBottom: 1,
    },
    logo: {
        width: 55,
        height: 70,
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
        textAlign: 'center',
        marginRight: 55, 
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
        fontSize: 8, 
        marginTop: 1
    },
    headerLine2: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginTop: 2,
        marginBottom: 15,
    },

    // BOX INFORMASI
    regBox: { 
        borderWidth: 1, 
        borderColor: '#000', 
        padding: 10, 
        marginBottom: 15, 
    },
    regTitle: { 
        fontSize: 10, 
        fontFamily: 'Helvetica-Bold', 
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
        textDecoration: 'underline'
    },
    infoRow: { 
        flexDirection: 'row', 
        marginBottom: 3 
    },
    label: { 
        width: 110, 
        fontSize: 8,
        fontFamily: 'Helvetica-Bold'
    },
    value: { 
        flex: 1,
        fontSize: 8,
        textTransform: 'uppercase'
    },

    // TABEL ARSIP (11 ITEM)
    table: { 
        width: '100%', 
        borderWidth: 1, 
        borderColor: '#000',
    },
    tableRow: { 
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 20,
        alignItems: 'center'
    },
    tableHeader: { 
        backgroundColor: '#f3f4f6', 
        fontFamily: 'Helvetica-Bold',
        height: 25
    },
    tableColNo: { 
        width: '7%', 
        borderRightWidth: 1, 
        padding: 4, 
        textAlign: 'center' 
    },
    tableColLabel: { 
        width: '43%', 
        borderRightWidth: 1, 
        padding: 4 
    },
    tableColNoDok: { 
        width: '35%', 
        borderRightWidth: 1, 
        padding: 4,
        fontSize: 7.5
    },
    tableColStatus: { 
        width: '15%', 
        padding: 4, 
        textAlign: 'center',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold'
    },

    // TANDA TANGAN
    footerContainer: { 
        marginTop: 25, 
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    signatureBox: {
        width: 180,
        textAlign: 'center'
    },
    signatureName: { 
        marginTop: 50, 
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
        textTransform: 'uppercase'
    },

    // FOOTER SYSTEM
    systemFooter: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        fontSize: 6,
        color: 'grey',
        textAlign: 'center'
    }
});

// --- KOMPONEN PRINT ---
export const ArsipPrintTemplate = ({ data, arsipFisik }: { data: any, arsipFisik: any }) => {
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${baseUrl}/logo-sragen.png`;

    // Mapping 11 Item Arsip (Data diambil dari gabungan Database dan Form Input)
    const items = [
        { id: 1, label: 'Dokumen Lingkungan Cetak', status: arsipFisik?.dokumenCetak, no: arsipFisik?.noDokumenCetak },
        { id: 2, label: 'PKPLH / Surat Izin Arsip', status: !!data.nomorIzinTerbit, no: data.nomorIzinTerbit },
        { id: 3, label: 'Uji Administrasi (BA HUA)', status: !!data.nomorUjiBerkas, no: data.nomorUjiBerkas },
        { id: 4, label: 'Verifikasi Lapangan (BA Verlap)', status: !!data.nomorBAVerlap, no: data.nomorBAVerlap },
        { id: 5, label: 'BA Pemeriksa / Sidang / Revisi', status: !!data.nomorBAPemeriksaan, no: data.nomorBAPemeriksaan },
        { id: 6, label: 'Surat Permohonan (Awal)', status: !!data.nomorSuratPermohonan, no: data.nomorSuratPermohonan },
        { id: 7, label: 'Lembar Registrasi (Checklist)', status: !!data.nomorChecklist, no: data.nomorChecklist },
        { id: 8, label: 'Berita Acara Pengembalian', status: !!data.tanggalPengembalian, no: data.tanggalPengembalian ? `Tgl: ${data.tanggalPengembalian}` : '-' },
        { id: 9, label: 'Tanda Terima Perbaikan (PHP)', status: !!data.nomorPHP, no: data.nomorPHP },
        { id: 10, label: 'Undangan Rapat / Sidang', status: arsipFisik?.undanganSidang, no: arsipFisik?.noUndanganSidang },
        { id: 11, label: 'Risalah Pengolah Data (RPD)', status: !!data.nomorRisalah, no: data.nomorRisalah },
    ];

    return (
        <Document title={`Lembar Kontrol Arsip - ${data.namaPemrakarsa}`}>
            <Page size="A4" style={styles.page}>
                
                {/* KOP SURAT RESMI */}
                <View style={styles.headerContainer}>
                    <Image style={styles.logo} src={logoSrc} /> 
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerText1}>PEMERINTAH KABUPATEN SRAGEN</Text>
                        <Text style={styles.headerText2}>DINAS LINGKUNGAN HIDUP</Text>
                        <Text style={styles.headerAddress}>Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214</Text>
                        <Text style={styles.headerAddress}>Laman: www.dlh.sragenkab.go.id | Pos-el: dlh@sragenkab.go.id</Text>
                    </View>
                </View>
                <View style={styles.headerLine2} />

                {/* JUDUL & INFORMASI */}
                <View style={styles.regBox}>
                    <Text style={styles.regTitle}>LEMBAR KONTROL PENGARSIPAN DIGITAL & FISIK</Text>
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
                        <Text style={styles.value}>: {data.nomorChecklist || '-'}</Text>
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
                            <Text style={[styles.tableColStatus, { color: item.status ? '#059669' : '#dc2626' }]}>
                                {item.status ? 'LENGKAP' : 'TIDAK ADA'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* TANDA TANGAN */}
                <View style={styles.footerContainer}>
                    <View style={styles.signatureBox}>
                        <Text>Sragen, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                        <Text style={{ marginTop: 2 }}>Petugas Arsip DLH,</Text>
                        <Text style={styles.signatureName}>..........................................</Text>
                        <Text style={{ fontSize: 7, color: 'grey', marginTop: 2 }}>NIP. ..........................................</Text>
                    </View>
                </View>

                {/* FOOTER SYSTEM AUTOMATION */}
                <Text style={styles.systemFooter}>
                    * Lembar kontrol ini dihasilkan otomatis oleh SI-DLH Sragen untuk verifikasi arsip fisik dan digital (Google Drive).
                    {"\n"}Dicetak pada: {new Date().toLocaleString('id-ID')} WIB
                </Text>

            </Page>
        </Document>
    );
};