'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LayoutDashboard, FileText, ArrowRightCircle, Archive, ClipboardList, LogOut, CheckSquare, Microscope, FileSearch, Printer } from 'lucide-react';

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    
    // @ts-ignore
    const userRole = session?.user?.role; 

    // --- DEFINISI MENU (SUDAH DIURUTKAN ULANG) ---
    const allNavItems = [
        // 1. MENU UMUM (Semua Bisa Akses)
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['mpp', 'dlh'] },

        // 2. MENU KHUSUS MPP
        { name: 'Registrasi Dokumen', href: '/register', icon: FileText, roles: ['mpp'] },
        
        // [UBAH 1 & 2] Penyerahan Kembali ditaruh DI ATAS Input PHP
        { name: 'Penyerahan Kembali', href: '/pengembalian', icon: ArrowRightCircle, roles: ['mpp'] },
        { name: 'Penerimaan Hasil Perbaikan', href: '/penerimaan', icon: ClipboardList, roles: ['mpp'] }, 
        
        { name: 'Cetak Ulang', href: '/cetak-ulang', icon: Printer, roles: ['mpp'] },

        // 3. MENU KHUSUS DLH
        { name: 'Uji Administrasi', href: '/uji-administrasi', icon: CheckSquare, roles: ['dlh'] },
        { name: 'Verifikasi Lapangan', href: '/verifikasi-lapangan', icon: Microscope, roles: ['dlh'] },
        { name: 'Pemeriksaan Substansi', href: '/pemeriksaan-substansi', icon: FileSearch, roles: ['dlh'] },
        { name: 'Risalah Pengolah', href: '/risalah', icon: FileText, roles: ['dlh'] },

        // 4. REKAP DATA
        { name: 'Rekapitulasi Data', href: '/rekap', icon: Archive, roles: ['mpp', 'dlh'] },
    ];

    const filteredNavItems = allNavItems.filter(item => 
        item.roles.includes(userRole)
    );

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    if (!session) return null;

    return (
        <>
            {/* Tombol Mobile */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-green-700 text-white md:hidden shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
            )}

            <aside 
                className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-[#14532d] text-white 
                    transform md:translate-x-0 transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:shrink-0 flex flex-col border-r border-green-800 shadow-xl
                `}
            >
                {/* Header Profile */}
                <div className="h-24 px-6 flex flex-col justify-center border-b border-green-800/50 bg-[#052e16]">
                    <h2 className="text-lg font-bold text-white tracking-wide">
                        SI<span className="text-orange-400">MON</span> DLH
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <p className="text-xs text-green-200 capitalize">
                            Halo, <span className="font-bold text-white">{session?.user?.name || userRole}</span>
                        </p>
                    </div>
                </div>

                {/* List Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                                    ${active 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md font-bold' 
                                        : 'text-green-100 hover:bg-green-800/50 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-green-300 group-hover:text-white'}`} />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Tombol Logout */}
                <div className="p-4 bg-[#052e16]">
                    <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-200 bg-red-900/30 rounded-xl hover:bg-red-900/50 hover:text-red-100 transition border border-red-900/30"
                    >
                        <LogOut size={18} className="mr-2" />
                        Keluar Sistem
                    </button>
                </div>
            </aside>
        </>
    );
}