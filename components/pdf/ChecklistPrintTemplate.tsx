'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// --- REGISTER FONT (Opsional tapi disarankan agar Bold konsisten di Drive) ---
// Helvetica-Bold biasanya sudah bawaan, namun kita pastikan stylingnya kuat.

const BORDER_COLOR = '#000000';
const BORDER_WIDTH = 1;

const styles = StyleSheet.create({
    page: { 
        paddingTop: 25,
        paddingBottom: 25,
        paddingHorizontal: 35, 
        fontFamily: 'Helvetica', 
        fontSize: 9, 
        color: '#000',
        lineHeight: 1.2
    },
    
    // --- JUDUL ---
    judulContainer: { textAlign: 'center', marginBottom: 12 },
    judulH2: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    judulH3: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    // --- INFO BOX ---
    metaTable: {
        width: '100%',
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        marginBottom: 8
    },
    metaRow: { flexDirection: 'row', minHeight: 14 },
    metaLabelCol: { 
        width: '30%', 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        backgroundColor: '#f3f4f6', 
        fontSize: 8 
    },
    metaSepCol: { 
        width: '3%', 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        textAlign: 'center', 
        fontSize: 8 
    },
    metaValueCol: { 
        width: '67%', 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        fontFamily: 'Helvetica-Bold', 
        fontSize: 8,
        textTransform: 'uppercase'
    },

    // --- TABEL CHECKLIST ---
    tableContainer: { 
        borderTopWidth: BORDER_WIDTH, 
        borderLeftWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR 
    },
    tableRow: { flexDirection: 'row', minHeight: 13 },
    tableCell: { 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        padding: 3, 
        fontSize: 8,
        justifyContent: 'center'
    },
    headerCell: { 
        backgroundColor: '#e5e7eb', 
        fontFamily: 'Helvetica-Bold', 
        textAlign: 'center', 
        padding: 4 
    },
    colNo: { width: '6%', textAlign: 'center' },
    colItem: { width: '64%' }, 
    colStatus: { width: '10%', textAlign: 'center' },
    colNote: { width: '20%' },

    // --- FOOTER ---
    footerWrapper: { 
        marginTop: 10, 
        borderTopWidth: BORDER_WIDTH, 
        borderLeftWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR 
    },
    footerHeader: { 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        fontFamily: 'Helvetica-Bold', 
        backgroundColor: '#f9fafb',
        fontSize: 8 
    },
    contactRow: { flexDirection: 'row', minHeight: 14 },
    contactLabel: { width: '40%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontSize: 8 },
    contactValue: { width: '60%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontSize: 8 },

    // Signature Area
    signatureArea: { flexDirection: 'row' },
    capDinasCol: { 
        width: '40%', 
        height: 85, 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR,
        textAlign: 'center'
    },
    rightCol: { width: '60%' },
    statusBox: { 
        height: 25, 
        padding: 3, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 4
    },
    signRow: { flexDirection: 'row', height: 60 },
    signBox: { 
        width: '50%', 
        padding: 4, 
        borderRightWidth: BORDER_WIDTH, 
        borderBottomWidth: BORDER_WIDTH, 
        borderColor: BORDER_COLOR, 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    signLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
    signName: { fontSize: 8, fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }
});

const allChecklistItems = [
    "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", 
    "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
    "Dokumen Lingkungan", 
    "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan A3", 
    "PKKPR",
    "NIB (Untuk Swasta atau Perorangan)", 
    "Fotocopy Status Lahan (Sertifikat)", 
    "Fotocopy KTP Penanggungjawab Kegiatan",
    "Foto Eksisting Lokasi Rencana Kegiatan + Titik Koordinat", 
    "Lembar Penapisan AMDALNET / Arahan Instansi Lingkungan Hidup",
    "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)", 
    "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)",
    "Pemenuhan Persetujuan Teknis Air Limbah*", 
    "Pemenuhan Rincian Teknis Limbah B3 Sementara*", 
    "Pemenuhan Persetujuan Teknis Emisi*", 
    "Pemenuhan Persetujuan Teknis Andalalin*", 
    "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis*", 
    "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING"
];

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (isNaN(date.getTime())) return dateString;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const ChecklistPrintTemplate = ({ data, checklistStatus, statusVerifikasi }: any) => {
    return (
        <Document title={`Checklist - ${data.namaPemrakarsa}`}>
            <Page size="A4" style={styles.page}>
                {/* JUDUL */}
                <View style={styles.judulContainer}>
                    <Text style={styles.judulH2}>CHECKLIST KELENGKAPAN BERKAS</Text>
                    <Text style={styles.judulH3}>PERMOHONAN PERSETUJUAN LINGKUNGAN</Text>
                </View>

                {/* INFO PEMRAKARSA */}
                <View style={styles.metaTable}>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Nama Kegiatan</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.namaKegiatan?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Jenis Permohonan*</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.jenisDokumen}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Nomor Registrasi (DLH)</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.nomorChecklist || "-"}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Tanggal Masuk Dokumen</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{formatDate(data.tanggalMasukDokumen)}</Text>
                    </View>
                </View>

                {/* TABEL CHECKLIST */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableRow} fixed>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNo]}>No</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colItem]}>Item Persyaratan Administrasi</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colStatus]}>Ada</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNote]}>Keterangan</Text>
                    </View>
                    {allChecklistItems.map((item, index) => {
                        // Pastikan checklistStatus berupa array boolean sesuai urutan
                        const isChecked = checklistStatus && checklistStatus[index] === true;
                        return (
                            <View style={styles.tableRow} key={index}>
                                <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
                                <Text style={[styles.tableCell, styles.colItem]}>{item}</Text>
                                <Text style={[styles.tableCell, styles.colStatus, { fontFamily: 'Helvetica-Bold', color: isChecked ? 'black' : 'transparent' }]}>
                                    {isChecked ? 'V' : ''}
                                </Text>
                                <Text style={[styles.tableCell, styles.colNote]}></Text>
                            </View>
                        );
                    })}
                </View>

                {/* FOOTER & PENGESAHAN */}
                <View style={styles.footerWrapper}>
                    <Text style={styles.footerHeader}>Kontak Person (Dapat Dihubungi)</Text>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactLabel}>Pemohon / Pemrakarsa</Text>
                        <Text style={styles.contactValue}>: {data.namaPemrakarsa} ({data.teleponPemrakarsa || '-'})</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Text style={styles.contactLabel}>Penerima Kuasa (Konsultan)</Text>
                        <Text style={styles.contactValue}>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</Text>
                    </View>

                    <View style={styles.signatureArea}>
                        {/* Area Cap */}
                        <View style={styles.capDinasCol}>
                            <Text style={{fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 40}}>Cap Dinas</Text>
                            <Text style={{fontSize: 6, color: '#666'}}>Bubuhkan stempel resmi disini</Text>
                        </View>

                        <View style={styles.rightCol}>
                            {/* Kotak Kesimpulan */}
                            <View style={styles.statusBox}>
                                <Text style={{fontSize: 8}}>Hasil Verifikasi :</Text>
                                <Text style={{fontFamily: 'Helvetica-Bold', fontSize: 9, textTransform: 'uppercase'}}>{statusVerifikasi || 'DALAM PROSES'}</Text>
                            </View>

                            {/* Kotak Tanda Tangan */}
                            <View style={styles.signRow}>
                                <View style={styles.signBox}>
                                    <Text style={styles.signLabel}>Penyerah Berkas</Text>
                                    <Text style={styles.signName}>({data.namaPengirim || '.................'})</Text>
                                </View>
                                <View style={styles.signBox}>
                                    <Text style={styles.signLabel}>Petugas Penerima</Text>
                                    <Text style={styles.signName}>({data.namaPetugas || '.................'})</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CATATAN KAKI */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                    <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#444' }}>*) Coret yang tidak perlu / Dokumen wajib ada</Text>
                    <Text style={{ fontSize: 6, color: '#999' }}>Arsip Digital SI-DLH Sragen | {new Date().toLocaleString('id-ID')}</Text>
                </View>
            </Page>
        </Document>
    );
};