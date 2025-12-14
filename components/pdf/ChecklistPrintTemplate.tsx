import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- HELPER FUNCTION ---
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (isNaN(date.getTime())) return '-';
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// --- DATA STATIC CHECKLIST ---
const allChecklistItems = [
    "Surat Permohonan Pemeriksaan Dokumen UKL-UPL / SPPL", 
    "Pernyataan Pengelolaan dan Pemantauan Lingkungan (Bermaterai)",
    "Dokumen Lingkungan", 
    "Peta (Peta Tapak, Peta Pengelolaan, Peta Pemantauan, dll) - Siteplan di Kertas A3", 
    "PKKPR",
    "NIB (Untuk Swasta atau Perorangan)", 
    "Fotocopy Status Lahan (Sertifikat)", 
    "Fotocopy KTP Penanggungjawab Kegiatan",
    "Foto Eksisting Lokasi Rencana Kegiatan Disertai dengan Titik Koordinat", 
    "Lembar Penapisan dari AMDALNET / Arahan dari Instansi Lingkungan Hidup",
    "Surat Kuasa Pekerjaan dari Pemrakarsa ke Konsultan (Bermaterai)", 
    "Perizinan yang Sudah Dimiliki atau Izin yang Lama (Jika Ada)",
    "Pemenuhan Persetujuan Teknis Air Limbah*", 
    "Pemenuhan Rincian Teknis Limbah B3 Sementara*", 
    "Pemenuhan Persetujuan Teknis Emisi*", 
    "Pemenuhan Persetujuan Teknis Andalalin*", 
    "Hasil Penapisan Kewajiban Pemenuhan Persetujuan Teknis*", 
    "Bukti Upload Permohonan pada AMDALNET dan/atau SIDARLING"
];

// --- STYLING ---
const BORDER_COLOR = '#000000';
const BORDER_WIDTH = 1;

const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        fontFamily: 'Helvetica', 
        fontSize: 10,
        color: '#000',
        lineHeight: 1.3
    },
    
    // --- JUDUL ---
    judulContainer: { textAlign: 'center', marginBottom: 20 },
    judulH2: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    judulH3: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    // --- INFO BOX (METADATA TABLE) ---
    metaTable: {
        width: '100%',
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        marginBottom: 15
    },
    metaRow: { flexDirection: 'row' },
    metaLabelCol: {
        width: '35%',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        backgroundColor: '#f9fafb', 
        fontFamily: 'Helvetica',
        fontSize: 9
    },
    metaSepCol: {
        width: '3%',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        textAlign: 'center',
        fontSize: 9
    },
    metaValueCol: {
        width: '62%',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold',
        fontSize: 9
    },

    // --- TABEL UTAMA CHECKLIST ---
    tableContainer: {
        marginTop: 5,
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    tableRow: { flexDirection: 'row' },
    tableCell: {
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        padding: 4,
        fontSize: 9
    },
    headerCell: {
        backgroundColor: '#e5e7eb',
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center'
    },
    colNo: { width: '6%', textAlign: 'center' },
    colItem: { width: '59%' },
    colStatus: { width: '15%', textAlign: 'center' },
    colNote: { width: '20%' },

    // --- FOOTER BARU (SESUAI GAMBAR) ---
    footerTable: {
        marginTop: 15,
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    // Baris Header Contact
    footerHeaderRow: {
        backgroundColor: '#fff',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    footerHeaderText: {
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold',
        fontSize: 9
    },
    // Baris Isi Contact
    contactRow: { flexDirection: 'row' },
    contactLabel: { 
        width: '40%', 
        padding: 5, 
        fontSize: 9, 
        borderRightWidth: BORDER_WIDTH, // Pembatas Vertikal 1
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    contactSeparator: {
        width: '2%',
        padding: 5,
        fontSize: 9,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        textAlign: 'center'
    },
    contactValue: { 
        width: '58%', 
        padding: 5, 
        fontSize: 9, 
        borderRightWidth: BORDER_WIDTH, // Penutup kanan tabel
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    // Area Tanda Tangan (Grid Layout)
    signatureArea: { flexDirection: 'row' },
    
    // Kolom Kiri: Cap Dinas
    capDinasCol: {
        width: '40%',
        height: 100, // Tinggi fix agar kotak cap luas
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
    },
    capDinasTitle: {
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold',
        fontSize: 9,
        marginBottom: 5
    },

    // Kolom Kanan: Status & TTD
    rightCol: { width: '60%' },
    
    // Status Box (Atas Kanan)
    statusBox: {
        height: 40,
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    // Tanda Tangan Box (Bawah Kanan)
    signContainer: { flexDirection: 'row', height: 60 },
    
    signBoxLeft: {
        width: '50%',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    signBoxRight: {
        width: '50%',
        padding: 5,
        borderRightWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    signLabel: {
        fontSize: 8,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold'
    },
    signName: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        marginTop: 20
    }
});

export const ChecklistPrintTemplate = ({ data, checklistStatus, statusVerifikasi }: any) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* 1. JUDUL (TANPA KOP) */}
                <View style={styles.judulContainer}>
                    <Text style={styles.judulH2}>CHECKLIST KELENGKAPAN BERKAS</Text>
                    <Text style={styles.judulH3}>PERMOHONAN PERSETUJUAN LINGKUNGAN</Text>
                </View>

                {/* 2. INFO BOX (METADATA TABLE) */}
                <View style={styles.metaTable}>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Nama Kegiatan</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.namaKegiatan}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Jenis Permohonan*</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.jenisDokumen}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Nomor Checklist Kelengkapan Berkas</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{data.nomorChecklist || "________"}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabelCol}>Tanggal Masuk Berkas</Text>
                        <Text style={styles.metaSepCol}>:</Text>
                        <Text style={styles.metaValueCol}>{formatDate(data.tanggalMasukDokumen)}</Text>
                    </View>
                </View>

                {/* 3. TABEL CHECKLIST ITEMS */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableRow} fixed>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNo]}>No</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colItem]}>Persyaratan Dokumen</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colStatus]}>Ada / Tidak</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNote]}>Keterangan</Text>
                    </View>

                    {allChecklistItems.map((item, index) => {
                        const isChecked = checklistStatus[index] === true;
                        return (
                            <View style={styles.tableRow} key={index}>
                                <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
                                <Text style={[styles.tableCell, styles.colItem]}>{item}</Text>
                                <Text style={[styles.tableCell, styles.colStatus, { fontFamily: 'Helvetica-Bold', textAlign: 'center', color: isChecked ? 'black' : 'transparent' }]}>
                                    {isChecked ? 'V' : ''}
                                </Text>
                                <Text style={[styles.tableCell, styles.colNote]}></Text>
                            </View>
                        );
                    })}
                </View>

                {/* 4. FOOTER BARU (GRID STYLE) */}
                <View style={styles.footerTable}>
                    
                    {/* Header: Contact Person */}
                    <View style={styles.footerHeaderRow}>
                        <Text style={styles.footerHeaderText}>Contact Person (Nomor Telepon)</Text>
                    </View>
                    
                    {/* Row: Pemohon */}
                    <View style={styles.contactRow}>
                        <Text style={styles.contactLabel}>Pemohon / Pemrakarsa / Pemberi Kuasa</Text>
                        <Text style={styles.contactSeparator}>:</Text>
                        <View style={styles.contactValue}>
                            <Text>{data.namaPemrakarsa}</Text>
                            <Text>({data.teleponPemrakarsa || '-'})</Text>
                        </View>
                    </View>

                    {/* Row: Penerima Kuasa */}
                    <View style={styles.contactRow}>
                        <Text style={styles.contactLabel}>Penerima Kuasa</Text>
                        <Text style={styles.contactSeparator}>:</Text>
                        <View style={styles.contactValue}>
                            <Text>{data.namaKonsultan || '-'}</Text>
                            <Text>({data.teleponKonsultan || '-'})</Text>
                        </View>
                    </View>

                    {/* Signature Grid */}
                    <View style={styles.signatureArea}>
                        {/* Kolom Kiri: Cap Dinas */}
                        <View style={styles.capDinasCol}>
                            <Text style={styles.capDinasTitle}>Kolom Cap Dinas</Text>
                        </View>

                        {/* Kolom Kanan: Status & TTD */}
                        <View style={styles.rightCol}>
                            {/* Kotak Status */}
                            <View style={styles.statusBox}>
                                <Text style={{fontSize: 9}}>Status Kelengkapan Berkas*:</Text>
                                <Text style={{fontFamily: 'Helvetica-Bold', fontWeight: 'bold', marginTop: 3}}>
                                    {statusVerifikasi || '...................'}
                                </Text>
                            </View>

                            {/* Kotak Tanda Tangan */}
                            <View style={styles.signContainer}>
                                {/* TTD Kiri: Pemohon */}
                                <View style={styles.signBoxLeft}>
                                    <View>
                                        <Text style={styles.signLabel}>Pemohon / Yang</Text>
                                        <Text style={styles.signLabel}>Menyerahkan Dokumen</Text>
                                    </View>
                                    <Text style={styles.signName}>({data.namaPengirim || 'AAA'})</Text>
                                </View>

                                {/* TTD Kanan: Petugas */}
                                <View style={styles.signBoxRight}>
                                    <View>
                                        <Text style={styles.signLabel}>Petugas Gerai Mal</Text>
                                        <Text style={styles.signLabel}>Pelayanan Publik</Text>
                                    </View>
                                    <Text style={styles.signName}>({data.namaPetugas || 'Ima'})</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>

                <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 10, color: '#444' }}>
                    *) Dokumen yang wajib dilampirkan
                </Text>

            </Page>
        </Document>
    );
};