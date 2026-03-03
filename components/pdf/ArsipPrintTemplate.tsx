import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- STYLING PDF (Menggunakan Flexbox) ---
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        fontSize: 10, 
        fontFamily: 'Helvetica',
        color: '#334155' 
    },
    header: { 
        marginBottom: 20, 
        textAlign: 'center', 
        borderBottom: 2, 
        paddingBottom: 10,
        borderColor: '#1e293b'
    },
    title: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        marginBottom: 4, 
        textTransform: 'uppercase',
        color: '#0f172a'
    },
    subtitle: { 
        fontSize: 10, 
        marginBottom: 2 
    },
    
    // Header Kotak (Identik dengan Lembar Registrasi)
    regBox: { 
        borderWidth: 1, 
        borderColor: '#000', 
        padding: 15, 
        marginBottom: 20, 
        borderRadius: 4 
    },
    regHeader: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        borderBottomWidth: 1, 
        borderColor: '#000',
        paddingBottom: 8, 
        marginBottom: 12, 
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    infoRow: { 
        flexDirection: 'row', 
        marginBottom: 6 
    },
    label: { 
        width: 140, 
        fontWeight: 'bold',
        color: '#475569'
    },
    value: { 
        flex: 1,
        fontWeight: 'bold',
        color: '#1e293b'
    },

    // Tabel 11 Item (Berbasis Flex)
    table: { 
        display: 'flex', 
        flexDirection: 'column', 
        width: 'auto', 
        marginTop: 15, 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderRightWidth: 0, 
        borderBottomWidth: 0 
    },
    tableRow: { 
        flexDirection: 'row',
        minHeight: 25,
        alignItems: 'center'
    },
    tableHeader: { 
        backgroundColor: '#f1f5f9', 
        fontWeight: 'bold' 
    },
    tableColNo: { 
        width: '8%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        padding: 5, 
        textAlign: 'center' 
    },
    tableColLabel: { 
        width: '42%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        padding: 5 
    },
    tableColNoDok: { 
        width: '35%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        padding: 5 
    },
    tableColStatus: { 
        width: '15%', 
        borderStyle: 'solid', 
        borderWidth: 1, 
        borderColor: '#000',
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        padding: 5, 
        textAlign: 'center' 
    },

    footer: { 
        marginTop: 40, 
        textAlign: 'right',
        paddingRight: 20
    },
    signature: { 
        marginTop: 60, 
        fontWeight: 'bold',
        textDecoration: 'underline'
    }
});

// --- KOMPONEN UTAMA ---
export const ArsipPrintTemplate = ({ data, arsipFisik }: any) => {
    // Daftar 11 Item Arsip (Gabungan Otomatis & Manual)
    const items = [
        { id: 1, label: 'Dokumen Lingkungan Cetak', status: arsipFisik.dokumenCetak, no: arsipFisik.noDokumenCetak },
        { id: 2, label: 'PKPLH Arsip', status: arsipFisik.pkplhArsip, no: arsipFisik.noPkplhArsip },
        { id: 3, label: 'Uji Administrasi', status: !!data.nomorUjiBerkas, no: data.nomorUjiBerkas },
        { id: 4, label: 'BA Verlap', status: !!data.nomorBAVerlap, no: data.nomorBAVerlap },
        { id: 5, label: 'BA Pemeriksa / Sidang / Revisi', status: !!data.nomorBAPemeriksaan, no: data.nomorBAPemeriksaan },
        { id: 6, label: 'Surat Permohonan (Awal)', status: arsipFisik.suratPermohonan, no: arsipFisik.noSuratPermohonan },
        { id: 7, label: 'Lembar Registrasi', status: !!data.nomorChecklist, no: data.nomorChecklist },
        { id: 8, label: 'Lembar Pengembalian', status: !!data.tanggalPengembalian, no: data.tanggalPengembalian ? `Tgl: ${data.tanggalPengembalian}` : '' },
        { id: 9, label: 'Tanda Terima Perbaikan (PHP)', status: !!data.nomorPHP, no: data.nomorPHP },
        { id: 10, label: 'Undangan Sidang', status: arsipFisik.undanganSidang, no: arsipFisik.noUndanganSidang },
        { id: 11, label: 'Penyusunan RPD', status: !!data.nomorRisalah, no: data.nomorRisalah },
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Kop Surat Instansi */}
                <View style={styles.header}>
                    <Text style={styles.title}>Pemerintah Kabupaten Sragen</Text>
                    <Text style={[styles.title, { fontSize: 12 }]}>Dinas Lingkungan Hidup</Text>
                    <Text style={{ fontSize: 8, marginTop: 2 }}>Jl. Letjen Sukowati No. 46 Sragen, Jawa Tengah</Text>
                </View>

                {/* Box Informasi (Mirip Lembar Registrasi) */}
                <View style={styles.regBox}>
                    <Text style={styles.regHeader}>Lembar Kontrol Pengarsipan Dokumen</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nama Kegiatan</Text>
                        <Text style={styles.value}>: {data.namaKegiatan?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Pemrakarsa</Text>
                        <Text style={styles.value}>: {data.namaPemrakarsa}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Jenis Dokumen</Text>
                        <Text style={styles.value}>: {data.jenisDokumen}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nomor Registrasi</Text>
                        <Text style={[styles.value, { fontFamily: 'Courier', fontSize: 9 }]}>: {data.nomorChecklist}</Text>
                    </View>
                </View>

                {/* Tabel Kelengkapan 11 Item */}
                <View style={styles.table}>
                    {/* Header Tabel */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableColNo}>No</Text>
                        <Text style={styles.tableColLabel}>Item Dokumen Arsip</Text>
                        <Text style={styles.tableColNoDok}>Nomor Surat / Keterangan</Text>
                        <Text style={styles.tableColStatus}>Status</Text>
                    </View>

                    {/* Baris Data */}
                    {items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.tableColNo}>{item.id}</Text>
                            <Text style={styles.tableColLabel}>{item.label}</Text>
                            <Text style={[styles.tableColNoDok, { fontSize: 8, fontFamily: 'Courier' }]}>
                                {item.no || '-'}
                            </Text>
                            <Text style={[
                                styles.tableColStatus, 
                                { 
                                    color: item.status ? '#059669' : '#dc2626', 
                                    fontWeight: 'bold',
                                    fontSize: 8
                                }
                            ]}>
                                {item.status ? 'LENGKAP' : 'BELUM ADA'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Tanda Tangan */}
                <View style={styles.footer}>
                    <Text>Sragen, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                    <Text style={{ marginTop: 4 }}>Petugas Arsip DLH,</Text>
                    <Text style={styles.signature}>( __________________________ )</Text>
                </View>
            </Page>
        </Document>
    );
};