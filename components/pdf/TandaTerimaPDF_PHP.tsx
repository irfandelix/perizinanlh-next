import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLING ---
const styles = StyleSheet.create({
    page: { 
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica', 
        fontSize: 10, 
        lineHeight: 1.3 
    },
    
    // --- KOP SURAT (SESUAI GAMBAR) ---
    kopContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Logo sejajar atas atau tengah
        marginBottom: 2
        // justifyContent: 'center' // Opsional: jika ingin konten di tengah page
    },
    // Logo di Kiri
    logo: {
        width: 65,  // Ukuran logo disesuaikan
        height: 75, 
        marginRight: 10,
        marginTop: 5
    },
    // Teks di Kanan/Tengah
    kopTextContainer: {
        flex: 1, 
        textAlign: 'center',
        marginTop: 5,
        marginLeft: -10 // Kompensasi visual agar teks benar-benar terlihat center di halaman
    },
    textPemkab: {
        fontSize: 14,
        fontFamily: 'Helvetica',
        marginBottom: 2
    },
    textDinas: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold', // Font Tebal
        fontWeight: 'bold',
        marginBottom: 2
    },
    textAlamat: {
        fontSize: 9,
        fontFamily: 'Helvetica',
    },

    // --- GARIS GANDA ---
    // Trik membuat garis ganda (Tebal atas, Tipis bawah)
    garisTebal: { 
        borderBottomWidth: 3, 
        borderColor: '#000', 
        marginTop: 5 
    },
    garisTipis: { 
        borderBottomWidth: 1, 
        borderColor: '#000', 
        marginTop: 2,
        marginBottom: 20 
    },

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
});

// Pastikan file "logo-sragen.png" ada di folder public project Anda
const LOGO_SRC = '/logo-sragen.png'; 

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
                
                {/* 1. KOP SURAT (LAYOUT PERSIS GAMBAR) */}
                <View style={styles.kopContainer}>
                    <Image src={LOGO_SRC} style={styles.logo} />
                    
                    <View style={styles.kopTextContainer}>
                        <Text style={styles.textPemkab}>PEMERINTAH KABUPATEN SRAGEN</Text>
                        <Text style={styles.textDinas}>DINAS LINGKUNGAN HIDUP</Text>
                        <Text style={styles.textAlamat}>Jalan Ronggowarsito Nomor 18B, Sragen Wetan, Sragen, Jawa Tengah 57214</Text>
                        <Text style={styles.textAlamat}>Telepon (0271) 891136, Faksimile (0271) 891136, Laman www.dlh.sragenkab.go.id</Text>
                        <Text style={styles.textAlamat}>Pos-el dlh.sragenkab.go.id</Text>
                    </View>
                </View>

                {/* Garis Ganda */}
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
                        <Text style={styles.value}>{formatDate(data.tanggalPHP || data.tanggalPHP1 || data.tanggalPengembalian)}</Text>
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

                {/* 4. KALIMAT PERNYATAAN */}
                <Text style={{ marginTop: 20, marginBottom: 10, textAlign: 'justify' }}>
                    Telah diterima dokumen perbaikan (Revisi) atas kegiatan tersebut di atas. Dokumen ini telah diverifikasi kelengkapannya dan akan diproses lebih lanjut sesuai dengan Standar Operasional Prosedur (SOP) yang berlaku pada Dinas Lingkungan Hidup Kabupaten Sragen.
                </Text>

                {/* 5. FOOTER TANDA TANGAN */}
                <View style={styles.footer}>
                    {/* KIRI */}
                    <View style={styles.signatureBox}>
                        <Text>Yang Menyerahkan</Text>
                        <Text>(Pemrakarsa / Konsultan)</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={styles.namaTerang}>({data.namaKonsultan || data.namaPemrakarsa || '....................'})</Text>
                    </View>
                    
                    {/* KANAN */}
                    <View style={styles.signatureBox}>
                        <Text>Petugas Penerima</Text>
                        <Text>Dinas Lingkungan Hidup</Text>
                        <View style={styles.signSpace}></View>
                        <Text style={styles.namaTerang}>({data.petugasPenerimaPerbaikan || data.petugasPHP || 'Petugas Pelayanan'})</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 40, color: '#666', textAlign: 'center' }}>
                    *Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Perizinan Lingkungan Hidup Kab. Sragen.
                </Text>
            </Page>
        </Document>
    );
};