import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; 
import { getDriveService } from '@/lib/drive';
import { Readable } from 'stream';

// Helper untuk mencari atau membuat folder berdasarkan nama Pemrakarsa
const getOrCreateFolder = async (drive: any, folderName: string, parentId: string) => {
    const res = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and '${parentId}' in parents and trashed = false`,
        fields: 'files(id, name)',
    });
    if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;

    const folder = await drive.files.create({
        requestBody: { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id',
    });
    return folder.data.id;
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const noUrut = formData.get('noUrut') as string;
        const dbField = formData.get('dbField') as string;
        const namaPemrakarsa = formData.get('namaPemrakarsa') as string; // Penting untuk struktur folder
        const fileType = formData.get('fileType') as string; // Contoh: BA_V, RPD, Checklist

        if (!file || !noUrut) {
            return NextResponse.json({ success: false, message: 'File atau Nomor Urut tidak ditemukan' }, { status: 400 });
        }

        // 1. Inisialisasi Drive Service
        const drive = getDriveService();
        const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID || 'root';

        // 2. Kelola Folder Pemrakarsa (Agar Drive tidak berantakan)
        const folderName = namaPemrakarsa || 'DOKUMEN_TANPA_NAMA';
        const targetFolderId = await getOrCreateFolder(drive, folderName, rootFolderId);

        // 3. Konversi File ke Stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        // 4. Upload ke Folder Spesifik
        const safeFileName = `${fileType}_NO_${noUrut}_${file.name}`.replace(/[\/\\?%*:|"<>]/g, '_');
        
        const driveResponse = await drive.files.create({
            requestBody: {
                name: safeFileName,
                parents: [targetFolderId],
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: 'id, webViewLink',
        });

        // 5. Set Permission agar bisa dibuka (Viewer Only)
        await drive.permissions.create({
            fileId: driveResponse.data.id!,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        const fileUrl = driveResponse.data.webViewLink;

        // 6. Update MongoDB (Gunakan noUrut sebagai filter)
        const client = await clientPromise;
        const collection = client.db().collection('dokumen');
        
        const updateResult = await collection.updateOne(
            { noUrut: parseInt(noUrut) },
            { 
                $set: { 
                    [dbField]: fileUrl,
                    [`${dbField}_id`]: driveResponse.data.id, // Simpan ID File juga untuk referensi hapus/edit
                    updatedAt: new Date()
                } 
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ success: false, message: 'Data dokumen tidak ditemukan di database' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Dokumen berhasil diupload ke Drive dan Database', 
            fileUrl 
        });

    } catch (error: any) {
        console.error('Upload Drive Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Terjadi kesalahan pada server' 
        }, { status: 500 });
    }
}