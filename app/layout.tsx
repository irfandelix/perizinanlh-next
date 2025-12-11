// app/layout.tsx

"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar'; 
import Providers from './Providers'; 
import React, { useMemo, PropsWithChildren, CSSProperties } from 'react'; // Tambahkan PropsWithChildren dan React

const inter = Inter({ subsets: ['latin'] });

// CATATAN: Karena file ini menjadi Client Component, Metadata harus dipindah ke file terpisah
// atau hanya menggunakan metadata statis.

export default function RootLayout({
  children,
}: PropsWithChildren<{}>) { 
  const pathname = usePathname();
  const isLoginPage = pathname === '/'; 

  // --- STYLE DASAR (Hanya properti longhand) ---
  const baseBodyStyles: CSSProperties = {
    margin: '0',
    padding: '0',
    overflowY: 'auto', // Default: Boleh scroll
    overflowX: 'hidden', // Default: Scroll horizontal dihilangkan
  };

  // --- OVERRIDE STYLE HANYA UNTUK LOGIN PAGE (Anti-Scroll, hanya properti longhand) ---
  // GANTI: overflow: 'hidden'
  // DENGAN: overflowY: 'hidden' dan overflowX: 'hidden'
  const loginOverrideStyles: CSSProperties = {
    height: '100vh',
    width: '100vw',
    overflowY: 'hidden', // Longhand pengganti overflow: hidden
    overflowX: 'hidden', // Longhand pengganti overflow: hidden
  };

  const finalBodyStyles: CSSProperties = useMemo(() => {
    if (isLoginPage) {
      return {
        ...baseBodyStyles,
        ...loginOverrideStyles,
      };
    }
    return baseBodyStyles;
  }, [isLoginPage]);


  return (
    <html lang="id">
      <body 
          className={inter.className} 
          style={finalBodyStyles} // Terapkan style dinamis ke BODY
      >
        <Providers> 
            
          {/* LOGIKA TAMPILAN LAYOUT */}
          {!isLoginPage ? (
            
            // Layout Dashboard/Register (DENGAN SIDEBAR DAN SCROLL KONTEN)
            <div className="flex h-screen bg-[#f8fafc]">
              <Sidebar />
              {/* MAIN: Izinkan scroll di sini */}
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
              </main>
            </div>
              
          ) : (
            
            // JIKA HALAMAN LOGIN, TAMPILKAN CHILDREN SAJA (Full Screen Overlay)
            <>{children}</>
          )}

        </Providers>
      </body>
    </html>
  );
}