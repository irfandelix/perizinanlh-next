'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Menu, X, LayoutDashboard, FileText, ArrowRightCircle, 
  Archive, ClipboardList, LogOut, CheckSquare, Microscope, 
  FileSearch, Printer, FileEdit, UserCircle 
} from 'lucide-react';

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    
    // @ts-ignore
    const userRole = session?.user?.role; 

    // --- DEFINISI MENU ---
    const allNavItems = [
        // 1. MENU UMUM
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['mpp', 'dlh'] },

        // 2. MENU KHUSUS MPP
        { name: 'Registrasi Dokumen', href: '/register', icon: FileText, roles: ['mpp'] },
        { name: 'Penyerahan Kembali', href: '/pengembalian', icon: ArrowRightCircle, roles: ['mpp'] },
        { name: 'Penerimaan Hasil Perbaikan', href: '/penerimaan', icon: ClipboardList, roles: ['mpp'] }, 
        { name: 'Cetak Ulang', href: '/cetak-ulang', icon: Printer, roles: ['mpp'] },

        // 3. MENU KHUSUS DLH
        { name: 'Uji Administrasi', href: '/uji-administrasi', icon: CheckSquare, roles: ['dlh'] },
        { name: 'Verifikasi Lapangan', href: '/verifikasi-lapangan', icon: Microscope, roles: ['dlh'] },
        { name: 'Pemeriksaan Substansi', href: '/pemeriksaan-substansi', icon: FileSearch, roles: ['dlh'] },
        { name: 'Pemeriksaan Revisi', href: '/pemeriksaan-revisi', icon: FileEdit, roles: ['dlh'] },
        { name: 'Risalah Pengolah', href: '/verifikasi', icon: FileText, roles: ['dlh'] },

        // 4. REKAP DATA
        { name: 'Rekapitulasi Data', href: '/rekap', icon: Archive, roles: ['mpp', 'dlh'] },
    ];

    const filteredNavItems = allNavItems.filter(item => 
        item.roles.includes(userRole)
    );

    const isActive = (href: string) => {
        if (pathname === href) return true;
        if (pathname.startsWith(`${href}/`)) return true;
        return false;
    };

    if (!session) return null;
    
    return (
        <>
            {/* Tombol Mobile Hamburger */}
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white text-gray-700 md:hidden shadow-md border border-gray-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Overlay Gelap untuk Mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
            )}

            <aside 
                className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-[#f8fafc] text-gray-700 
                    transform md:translate-x-0 transition-transform duration-300 ease-in-out font-sans
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:shrink-0 flex flex-col h-screen print:hidden
                `}
            >
                {/* Header Profile ala Google */}
                <div className="px-6 py-6 mb-2">
                    <h2 className="text-[22px] text-gray-600 font-normal leading-tight">
                        SIMON <span className="font-medium text-gray-900">DLH</span>
                    </h2>
                    
                    {/* Profil Singkat */}
                    <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-full shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {session?.user?.name || userRole}
                            </p>
                            <p className="text-xs text-gray-500 truncate capitalize">
                                {userRole} Access
                            </p>
                        </div>
                    </div>
                </div>

                {/* List Menu Scrollable */}
                <nav className="flex-1 overflow-y-auto py-2 pr-3 space-y-1">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    group flex items-center w-full px-6 py-3 text-[14px] font-medium
                                    rounded-r-full transition-all duration-200 ease-in-out relative
                                    ${active 
                                        ? 'bg-[#c2e7ff] text-[#001d35]' // Gaya Aktif Google (Biru Muda)
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Gaya Tidak Aktif
                                    }
                                `}
                            >
                                <item.icon 
                                    className={`
                                        w-5 h-5 mr-4 transition-colors
                                        ${active ? 'text-[#001d35] fill-current' : 'text-gray-500 group-hover:text-gray-700'}
                                    `} 
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span className="tracking-wide">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Tombol Logout di Bawah */}
                <div className="p-4 mt-auto">
                    <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full px-6 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-r-full transition-all duration-200"
                    >
                        <LogOut size={20} className="mr-4" />
                        Keluar Sistem
                    </button>
                    
                    <div className="mt-4 px-6 text-xs text-gray-400">
                        &copy; 2025 Dinas Lingkungan Hidup
                    </div>
                </div>
            </aside>
        </>
    );
}