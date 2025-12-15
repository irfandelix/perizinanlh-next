import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLES ---
const styles = StyleSheet.create({
    page: { 
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica', 
        fontSize: 10, 
        lineHeight: 1.5 
    },
    
    // --- KOP SURAT ---
    kopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    logo: {
        width: 55,
        height: 70, 
        marginRight: 15
    },
    kopTextCenter: {
        flex: 1, // Agar teks mengambil sisa ruang dan bisa di-center
        textAlign: 'center',
        justifyContent: 'center'
    },
    textPemkab: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        textTransform: 'uppercase',
        marginBottom: 2
    },
    textDinas: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2
    },
    textAlamat: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        fontStyle: 'italic'
    },
    // Garis Kop
    garisTebal: { borderBottomWidth: 3, borderColor: '#000', marginBottom: 2, marginTop: 5 },
    garisTipis: { borderBottomWidth: 1, borderColor: '#000', marginBottom: 20 },

    // --- JUDUL DOKUMEN ---
    judulDokumen: { 
        textAlign: 'center', 
        fontSize: 12, 
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold', 
        marginBottom: 20, 
        textTransform: 'uppercase', 
        textDecoration: 'underline' 
    },

    // --- ISI TABEL DATA ---
    row: { flexDirection: 'row', marginBottom: 6 },
    label: { width: '30%' },
    separator: { width: '3%', textAlign: 'center' },
    value: { width: '67%', fontFamily: 'Helvetica-Bold', fontWeight: 'bold' },

    // --- FOOTER TTD ---
    footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
    signatureBox: { width: '45%', textAlign: 'center' },
    signSpace: { height: 65 },
    namaTerang: { fontFamily: 'Helvetica-Bold', fontWeight: 'bold', textDecoration: 'underline' },
    nip: { fontSize: 9, marginTop: 2 }
});

// GANTI DENGAN NAMA FILE LOGO ANDA DI FOLDER PUBLIC
// Pastikan file "logo-sragen.png" ada di folder public
const LOGO_SRC = '/logo-sragen.png'; 

export const TandaTerimaPDF_PHP = ({ data }: { data: any }) => {
    // Helper Format Tanggal
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* 1. KOP SURAT RESMI */}
                <View style={styles.kopContainer}>
                    {/* Logo (Pastikan file ada di folder public) */}
                    {/* Jika error gambar tidak muncul, cek nama file di folder public */}
                    <Image src={LOGO_SRC} style={styles.logo} />
                    
                    <View style={styles.kopTextCenter}>
                        <Text style={styles.textPemkab}>PEMERINTAH KABUPATEN SRAGEN</Text>
                        <Text style={styles.textDinas}>DINAS LINGKUNGAN HIDUP</Text>
                        <Text style={styles.textAlamat}>Jl. Dr. Sutomo No. 5 Sragen, Telp. (0271) 891008</Text>
                        <Text style={styles.textAlamat}>Kode Pos 57212</Text>
                    </View>
                </View>
                {/* Garis Ganda di bawah Kop */}
                <View style={styles.garisTebal} />
                <View style={styles.garisTipis} />

                {/* 2. JUDUL */}
                <Text style={styles.judulDokumen}>TANDA TERIMA PERBAIKAN DOKUMEN (PHP)</Text>

                {/* 3. ISI DATA */}
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
                    <View style={styles.row}>
                        <Text style={styles.label}>Jenis Dokumen</Text>
                        <Text style={styles.separator}>:</Text>
                        <Text style={styles.value}>{data.jenisDokumen || 'UKL-UPL / AMDAL'}</Text>
                    </View>
                </View>

                {/* 4. KALIMAT PERNYATAAN */}
                <Text style={{ marginTop: 20, marginBottom: 10, textAlign: 'justify' }}>
                    Telah diterima dokumen perbaikan (Revisi) atas kegiatan tersebut di atas. Dokumen ini telah diverifikasi kelengkapannya dan akan diproses lebih lanjut sesuai dengan Standar Operasional Prosedur (SOP) yang berlaku pada Dinas Lingkungan Hidup Kabupaten Sragen.
                </Text>

                {/* 5. FOOTER TANDA TANGAN */}
                <View style={styles.footer}>
                    {/* KIRI: PENYERAH */}
                    <View style={styles.signatureBox}>
                        <Text>Yang Menyerahkan</Text>
                        <Text>(Pemrakarsa / Konsultan)</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={styles.namaTerang}>({data.namaKonsultan || data.namaPemrakarsa || '....................'})</Text>
                    </View>
                    
                    {/* KANAN: PENERIMA */}
                    <View style={styles.signatureBox}>
                        <Text>Petugas Penerima</Text>
                        <Text>Dinas Lingkungan Hidup</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={styles.namaTerang}>({data.petugasPenerimaPerbaikan || data.petugasPHP || 'Petugas Pelayanan'})</Text>
                        {/* <Text style={styles.nip}>NIP. ...........................</Text> */}
                    </View>
                </View>

                <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 40, color: '#666', textAlign: 'center' }}>
                    *Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Perizinan Lingkungan Hidup Kab. Sragen.
                </Text>
            </Page>
        </Document>
    );
};