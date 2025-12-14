import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- HELPER FUNCTION ---
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    if (isNaN(date.getTime())) return '-';
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

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

const BORDER_COLOR = '#000000';
const BORDER_WIDTH = 1;

const styles = StyleSheet.create({
    page: { 
        padding: 20, // Padding diperkecil agar muat 1 halaman
        fontFamily: 'Helvetica', 
        fontSize: 9, // Ukuran font dasar diperkecil
        color: '#000',
        lineHeight: 1.2
    },
    
    // --- JUDUL ---
    judulContainer: { textAlign: 'center', marginBottom: 10 },
    judulH2: { fontSize: 11, fontWeight: 'bold', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
    judulH3: { fontSize: 11, fontWeight: 'bold', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

    // --- INFO BOX ---
    metaTable: {
        width: '100%',
        borderTopWidth: BORDER_WIDTH,
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        marginBottom: 8
    },
    metaRow: { flexDirection: 'row', minHeight: 14 },
    metaLabelCol: { width: '35%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, backgroundColor: '#f0f0f0', fontSize: 8 },
    metaSepCol: { width: '3%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, textAlign: 'center', fontSize: 8 },
    metaValueCol: { width: '62%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontFamily: 'Helvetica-Bold', fontWeight: 'bold', fontSize: 8 },

    // --- TABEL CHECKLIST ---
    tableContainer: { marginTop: 2, borderTopWidth: BORDER_WIDTH, borderLeftWidth: BORDER_WIDTH, borderColor: BORDER_COLOR },
    tableRow: { flexDirection: 'row', minHeight: 12 },
    tableCell: { borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, padding: 3, fontSize: 8 },
    headerCell: { backgroundColor: '#e5e7eb', fontWeight: 'bold', fontFamily: 'Helvetica-Bold', textAlign: 'center', padding: 4 },
    colNo: { width: '6%', textAlign: 'center' },
    colItem: { width: '64%' }, // Lebar diperbesar sedikit
    colStatus: { width: '10%', textAlign: 'center' },
    colNote: { width: '20%' },

    // --- FOOTER ---
    footerWrapper: { marginTop: 10, borderTopWidth: BORDER_WIDTH, borderLeftWidth: BORDER_WIDTH, borderColor: BORDER_COLOR },
    footerHeader: { padding: 4, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontFamily: 'Helvetica-Bold', fontWeight: 'bold', fontSize: 8 },
    contactRow: { flexDirection: 'row', minHeight: 14 },
    contactLabel: { width: '40%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontSize: 8 },
    contactValue: { width: '60%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, fontSize: 8 },

    // Signature Area
    signatureArea: { flexDirection: 'row' },
    capDinasCol: { width: '40%', height: 70, padding: 4, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR },
    rightCol: { width: '60%' },
    statusBox: { height: 25, padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'center' },
    signRow: { flexDirection: 'row', height: 45 },
    signBox: { width: '50%', padding: 3, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'space-between' },
    signLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', fontWeight: 'bold', textAlign: 'center' },
    signName: { fontSize: 8, fontFamily: 'Helvetica', marginTop: 15 }
});

export const ChecklistPrintTemplate = ({ data, checklistStatus, statusVerifikasi }: any) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.judulContainer}>
                    <Text style={styles.judulH2}>CHECKLIST KELENGKAPAN BERKAS</Text>
                    <Text style={styles.judulH3}>PERMOHONAN PERSETUJUAN LINGKUNGAN</Text>
                </View>

                <View style={styles.metaTable}>
                    <View style={styles.metaRow}><Text style={styles.metaLabelCol}>Nama Kegiatan</Text><Text style={styles.metaSepCol}>:</Text><Text style={styles.metaValueCol}>{data.namaKegiatan}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabelCol}>Jenis Permohonan*</Text><Text style={styles.metaSepCol}>:</Text><Text style={styles.metaValueCol}>{data.jenisDokumen}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabelCol}>Nomor Checklist</Text><Text style={styles.metaSepCol}>:</Text><Text style={styles.metaValueCol}>{data.nomorChecklist || "-"}</Text></View>
                    <View style={styles.metaRow}><Text style={styles.metaLabelCol}>Tanggal Masuk</Text><Text style={styles.metaSepCol}>:</Text><Text style={styles.metaValueCol}>{formatDate(data.tanggalMasukDokumen)}</Text></View>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableRow} fixed>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNo]}>No</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colItem]}>Dokumen</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colStatus]}>Ada</Text>
                        <Text style={[styles.tableCell, styles.headerCell, styles.colNote]}>Ket</Text>
                    </View>
                    {allChecklistItems.map((item, index) => {
                        const isChecked = checklistStatus[index] === true;
                        return (
                            <View style={styles.tableRow} key={index}>
                                <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
                                <Text style={[styles.tableCell, styles.colItem]}>{item}</Text>
                                <Text style={[styles.tableCell, styles.colStatus, { fontFamily: 'Helvetica-Bold', textAlign: 'center', color: isChecked ? 'black' : 'transparent' }]}>{isChecked ? 'V' : ''}</Text>
                                <Text style={[styles.tableCell, styles.colNote]}></Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footerWrapper}>
                    <Text style={styles.footerHeader}>Contact Person (Nomor Telepon)</Text>
                    <View style={styles.contactRow}><Text style={styles.contactLabel}>Pemohon / Pemrakarsa</Text><Text style={styles.contactValue}>: {data.namaPemrakarsa} ({data.teleponPemrakarsa || '-'})</Text></View>
                    <View style={styles.contactRow}><Text style={styles.contactLabel}>Penerima Kuasa</Text><Text style={styles.contactValue}>: {data.namaKonsultan || '-'} ({data.teleponKonsultan || '-'})</Text></View>

                    <View style={styles.signatureArea}>
                        <View style={styles.capDinasCol}><Text style={{fontSize: 8, fontWeight: 'bold'}}>(Cap Dinas)</Text></View>
                        <View style={styles.rightCol}>
                            <View style={styles.statusBox}><Text style={{fontSize: 8}}>Status Kelengkapan Berkas*:</Text><Text style={{fontWeight: 'bold', fontSize: 9}}>{statusVerifikasi}</Text></View>
                            <View style={styles.signRow}>
                                <View style={styles.signBox}><View><Text style={styles.signLabel}>Penyerah</Text><Text style={styles.signLabel}>Dokumen</Text></View><Text style={styles.signName}>({data.namaPengirim || '.....'})</Text></View>
                                <View style={styles.signBox}><View><Text style={styles.signLabel}>Petugas</Text><Text style={styles.signLabel}>Pelayanan</Text></View><Text style={styles.signName}>({data.namaPetugas || '.....'})</Text></View>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 5, color: '#444' }}>*) Dokumen wajib dilampirkan</Text>
            </Page>
        </Document>
    );
};