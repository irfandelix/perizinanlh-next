import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export default withAuth(
    function middleware(req: NextRequestWithAuth) { 
        
        const token = req.nextauth.token;
        const role = token?.role as string | undefined; 
        const path = req.nextUrl.pathname;
        
        // --- LOGIKA UTAMA: PENGALIHAN BERDASARKAN ROLE (Setelah Login) ---
        
        // ** PENTING ** // 1. Jika user sudah login (ada token), dan mencoba mengakses root '/' atau '/dashboard'
        if (path === '/' || path.startsWith('/dashboard')) {
            if (role === 'mpp') {
                return NextResponse.redirect(new URL('/register', req.url)); 
            }
            if (role === 'dlh') {
                return NextResponse.redirect(new URL('/uji-administrasi', req.url)); 
            }
            // Jika role tidak dikenal atau '/' tidak sesuai, biarkan lanjut.
        }
        
        // 2. PROTEKSI ROLE (Jika user mencoba mengakses rute milik peran lain)
        const dlhPaths = ['/uji-administrasi', '/verlap', '/pemeriksaan', '/risalah'];
        if (dlhPaths.some(p => path.startsWith(p)) && role !== 'dlh') {
            return NextResponse.redirect(new URL('/', req.url)); 
        }

        const mppPaths = ['/register', '/penerimaan', '/pengembalian', '/cetak-ulang'];
        if (mppPaths.some(p => path.startsWith(p)) && role !== 'mpp') {
            return NextResponse.redirect(new URL('/', req.url)); 
        }

        // Default: Lanjutkan request
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, 
        },
        pages: {
             signIn: '/login', 
        }
    }
);

// Rute yang dilindungi. Jika rute ini diakses TANPA token, akan dialihkan ke /login.
export const config = {
    matcher: [
        '/',
        '/dashboard/:path*', // TAMBAHKAN INI
        '/register/:path*',
        '/penerimaan/:path*',
        '/pengembalian/:path*',
        '/cetak-ulang/:path*',
        '/uji-administrasi/:path*',
        '/verlap/:path*',
        '/pemeriksaan/:path*',
        '/risalah/:path*',
        '/rekap/:path*',
    ]
};