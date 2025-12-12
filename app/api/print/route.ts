import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Konfigurasi agar Chromium berjalan di Vercel (Wajib)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    // --- SETUP PATH BROWSER ---
    let executablePath: string;
    
    if (process.env.NODE_ENV === 'development') {
        // GANTI DENGAN PATH CHROME DI KOMPUTER ANDA
        executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; 
    } else {
        // Path otomatis untuk Vercel
        executablePath = await chromium.executablePath();
    }

    // --- LAUNCH BROWSER ---
    // Solusi Error TypeScript: Kita cast 'chromium' ke 'any' untuk mengakses properti args/headless
    const chromiumAny = chromium as any;

    const browser = await puppeteer.launch({
      args: chromiumAny.args,
      defaultViewport: chromiumAny.defaultViewport,
      executablePath: executablePath,
      headless: chromiumAny.headless,
      ignoreHTTPSErrors: true,
    } as any); // <--- KUNCI PERBAIKAN: Tambahkan 'as any' di sini

    const page = await browser.newPage();

    // Set Konten HTML
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF (Format A4)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // --- RETURN RESPONSE ---
    // Solusi Error Uint8Array: Cast ke 'any' agar diterima sebagai BodyInit
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="tanda_terima.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: String(error) }, 
      { status: 500 }
    );
  }
}