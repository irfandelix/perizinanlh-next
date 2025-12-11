import { NextResponse } from 'next/server';
import clientPromise, { DB_NAME } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { nomorChecklist } = await request.json();
        
        if (!nomorChecklist) {
            return NextResponse.json({ success: false, message: 'Nomor Checklist wajib diisi.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        
        const record = await db.collection('dokumen').findOne({ nomorChecklist });

        if (record) {
            return NextResponse.json({ success: true, data: record });
        } else {
            return NextResponse.json({ success: false, message: 'Data tidak ditemukan.' });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}