import { NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/db';
import { getDriveService } from '@/lib/drive';
import { Readable } from 'stream';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const noUrut = formData.get('noUrut') as string;
        const dbField = formData.get('dbField') as string;
        const namaKegiatan = formData.get('namaKegiatan') as string;
        const fileType = formData.get('fileType') as string;

        if (!file || !noUrut) {
            return NextResponse.json({ success: false, message: 'File/Data kurang' }, { status: 400 });
        }

        // Konversi File Blob ke Node.js Buffer Stream agar Google Drive API bisa baca
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        // Upload ke Drive
        const drive = getDriveService();
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';

        const driveResponse = await drive.files.create({
            requestBody: {
                name: `${fileType}_${noUrut}_${namaKegiatan.replace(/[\/\\?%*:|"<>]/g, '_')}_${file.name}`,
                parents: [folderId],
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: 'id, webViewLink',
        });

        // Set Permission Public
        await drive.permissions.create({
            fileId: driveResponse.data.id!,
            requestBody: { role: 'reader', type: 'anyone' },
        });

        const fileUrl = driveResponse.data.webViewLink;

        // Update MongoDB
        const client = await clientPromise;
        const collection = client.db(DB_NAME).collection('dokumen');
        
        await collection.updateOne(
            { noUrut: parseInt(noUrut) },
            { $set: { [dbField]: fileUrl } }
        );

        return NextResponse.json({ success: true, message: 'Upload Berhasil', fileUrl });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal Upload' }, { status: 500 });
    }
}