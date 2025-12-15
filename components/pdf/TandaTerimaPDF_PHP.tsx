// components/pdf/TandaTerimaPDF_PHP.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5 },
    header: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10, marginBottom: 20 },
    headerText: { justifyContent: 'center', width: '100%', alignItems: 'center' },
    title: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
    subtitle: { fontSize: 10 },
    
    // Content
    judulDokumen: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase', textDecoration: 'underline' },
    row: { flexDirection: 'row', marginBottom: 5 },
    label: { width: '30%' },
    separator: { width: '5%' },
    value: { width: '65%', fontWeight: 'bold' },
    
    // Footer
    footer: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
    signatureBox: { width: '40%', textAlign: 'center' },
    signSpace: { height: 60 },
    line: { borderBottomWidth: 1, borderBottomColor: '#000', width: '80%', alignSelf: 'center', marginTop: 5 }
});

export const TandaTerimaPDF_PHP = ({ data }: { data: any }) => {
    // Format Tanggal Indonesia
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>DINAS LINGKUNGAN HIDUP</Text>
                        <Text style={styles.subtitle}>TANDA TERIMA PERBAIKAN DOKUMEN LINGKUNGAN</Text>
                    </View>
                </View>

                {/* JUDUL */}
                <Text style={styles.judulDokumen}>TANDA TERIMA PENYERAHAN HASIL PERBAIKAN (PHP)</Text>

                {/* ISI DATA */}
                <View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nomor Registrasi</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{data.nomorChecklist || data.noUrut}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nomor PHP (Revisi)</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{data.nomorPHP || data.nomorPHP1 || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tanggal Penyerahan</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{formatDate(data.tanggalPHP || data.tanggalPHP1)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nama Kegiatan</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{data.namaKegiatan}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Pemrakarsa</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{data.namaPemrakarsa}</Text>
                    </View>
                </View>

                <Text style={{ marginTop: 20, marginBottom: 20 }}>
                    Telah diterima dokumen perbaikan (Revisi) untuk kegiatan tersebut di atas guna diproses lebih lanjut sesuai peraturan yang berlaku.
                </Text>

                {/* FOOTER TANDA TANGAN */}
                <View style={styles.footer}>
                    <View style={styles.signatureBox}>
                        <Text>Yang Menyerahkan</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={{fontWeight: 'bold'}}>({data.namaKonsultan || data.namaPemrakarsa || '....................'})</Text>
                        <View style={styles.line}></View>
                    </View>
                    
                    <View style={styles.signatureBox}>
                        <Text>Petugas Penerima</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={{fontWeight: 'bold'}}>({data.petugasPenerimaPerbaikan || data.petugasPHP || 'Petugas Pelayanan'})</Text>
                        <View style={styles.line}></View>
                    </View>
                </View>

                <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 30, color: '#666' }}>
                    *Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Perizinan LH.
                </Text>
            </Page>
        </Document>
    );
};