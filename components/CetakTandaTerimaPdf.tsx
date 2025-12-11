'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register Font (optional, for better visual consistency)
// Font.register({ family: 'Helvetica-Bold', src: 'path/to/Helvetica-Bold.ttf' }); 
// Note: React-PDF has default access to Helvetica, Times-Roman, Courier

// --- STYLES ---
const styles = StyleSheet.create({
    page: {
        padding: 50, // Padding halaman A4 Portrait
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    // --- KOP SURAT ---
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingBottom: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    headerSubText: {
        fontSize: 10,
        marginTop: 2,
    },
    title: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
        marginBottom: 30,
        textTransform: 'uppercase',
        textDecoration: 'underline'
    },
    // Table Utilities
    table: { 
        width: "100%", 
        marginBottom: 30,
    }, 
    tableRow: { 
        flexDirection: "row",
        paddingVertical: 5,
    }, 
    tableColLeft: { 
        width: '30%', // Lebar untuk Label
    },
    tableColSep: {
        width: '2%', // Lebar untuk Tanda Titik Dua (:)
    },
    tableColRight: {
        width: '68%', // Lebar untuk Nilai
        fontFamily: 'Helvetica-Bold',
    },
    textBody: { 
        fontSize: 11,
    },
    // Signature Section
    signContainer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    signatureBlock: {
        width: '45%',
        textAlign: 'center',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        marginTop: 40,
        paddingBottom: 2,
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    footerNote: {
        fontSize: 9,
        fontStyle: 'italic',
        marginTop: 50,
        textAlign: 'left',
        color: '#444'
    }
});

// Helper Date
const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    if (includeTime) {
         options.hour = '2-digit';
         options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('id-ID', options).format(date);
};

// --- DOKUMEN PDF ---
export const TandaTerimaDocument = ({ data }: any) => {
    
    // Tentukan tanggal tempat penandatanganan (misal: Tanggal Masuk Dokumen)
    const tanggalTtd = formatDate(data.tanggalMasukDokumen);
    
    return (
        <Document>
            {/* size="A4" orientation="portrait" adalah default, tapi kita set eksplisit */}
            <Page size="A4" orientation="portrait" style={styles.page}> 
                
                {/* --- KOP SURAT --- */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Pemerintah Kabupaten Sragen</Text>
                    <Text style={styles.headerText}>Dinas Lingkungan Hidup</Text>
                    <Text style={styles.headerSubText}>Jl. Raya Sukowati No. 255 Sragen, Jawa Tengah - Kode Pos: 57211</Text>
                </View>

                {/* --- JUDUL DOKUMEN --- */}
                <Text style={styles.title}>TANDA TERIMA PENYERAHAN DOKUMEN AWAL</Text>

                {/* --- ISI / DETAIL DOKUMEN --- */}
                <View style={styles.table}>
                    {/* Baris 1: Nama Kegiatan */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Nama Kegiatan</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={styles.textBody}>{data.namaKegiatan}</Text></View>
                    </View>
                    
                    {/* Baris 2: Pemrakarsa */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Nama Pemrakarsa</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={styles.textBody}>{data.namaPemrakarsa}</Text></View>
                    </View>

                    {/* Baris 3: Jenis Dokumen */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Jenis Dokumen</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={styles.textBody}>{data.jenisDokumen}</Text></View>
                    </View>
                    
                    {/* Baris 4: Nomor Registrasi */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Nomor Registrasi/Checklist</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={{...styles.textBody, fontFamily: 'Helvetica-Bold', fontSize: 12 }}>{data.nomorChecklist}</Text></View>
                    </View>
                    
                    {/* Baris 5: Tanggal Masuk */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Tanggal Diterima</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={styles.textBody}>{formatDate(data.tanggalMasukDokumen)}</Text></View>
                    </View>

                    {/* Baris 6: Alamat Kegiatan */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColLeft}><Text style={styles.textBody}>Lokasi Kegiatan</Text></View>
                        <View style={styles.tableColSep}><Text style={styles.textBody}>:</Text></View>
                        <View style={styles.tableColRight}><Text style={styles.textBody}>{data.lokasiKegiatan}</Text></View>
                    </View>
                </View>

                {/* --- TANDA TANGAN --- */}
                <View style={styles.signContainer}>
                    {/* KIRI: PEMOHON */}
                    <View style={styles.signatureBlock}>
                        <Text style={styles.textBody}>Yang Menyerahkan,</Text>
                        <Text style={styles.textBody}>Pemrakarsa/Kuasa</Text>
                        <Text style={styles.signatureLine}>
                            {data.namaPengirim || '.....................................'}
                        </Text>
                    </View>

                    {/* KANAN: PETUGAS */}
                    <View style={styles.signatureBlock}>
                        <Text style={styles.textBody}>Sragen, {tanggalTtd}</Text>
                        <Text style={styles.textBody}>Petugas Penerima Dokumen</Text>
                        <Text style={styles.signatureLine}>
                            {data.namaPetugas || '.....................................'}
                        </Text>
                    </View>
                </View>

                {/* FOOTER */}
                <Text style={styles.footerNote}>
                    Catatan: Tanda terima ini adalah bukti penyerahan berkas awal. Proses selanjutnya akan dilanjutkan dengan Uji Administrasi.
                </Text>

            </Page>
        </Document>
    );
}