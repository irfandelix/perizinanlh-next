import { NextResponse, NextRequest } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { htmlContent } = await request.json();

        let browser;

        if (process.env.NODE_ENV === 'production') {
            // --- SETTING VERCEL (Versi 119.0.0) ---
            
            // Konfigurasi khusus @sparticuz/chromium v119
            chromium.setGraphicsMode = false;
            
            // Load font agar emoji/text terbaca (Opsional tapi disarankan)
            await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            } as any);

        } else {
            // --- SETTING LOCALHOST (Windows) ---
            
            // Pastikan path ini benar sesuai laptop kamu
            const localExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; 
            
            browser = await puppeteer.launch({
                args: [],
                executablePath: localExecutablePath,
                headless: true,
            } as any);
        }

        const page = await browser.newPage();

        // Set konten HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="dokumen.pdf"',
            },
        });

    } catch (error: any) {
        console.error("Print Error:", error);
        return NextResponse.json(
            { error: 'Gagal mencetak PDF', details: error.message }, 
            { status: 500 }
        );
    }
}