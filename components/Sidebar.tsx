'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
    Menu, X, LayoutDashboard, FileText, ArrowRightCircle, 
    Archive, ClipboardList, LogOut, CheckSquare, MapPin, // PERBAIKAN: Ganti Microscope dengan MapPin untuk Verlap
    BookOpen, FileEdit, Globe, Printer, FileCheck // PERBAIKAN: Sesuaikan ikon
} from 'lucide-react';

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    
    // @ts-ignore
    const userRole = session?.user?.role; 

    // --- DEFINISI MENU DENGAN WARNA SESUAI TEMA HALAMAN ---
    const allNavItems = [
        // 1. MENU UMUM
        { 
            name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['mpp', 'dlh'],
            color: 'text-blue-600', bgColor: 'bg-blue-100' 
        },

        // 2. MENU KHUSUS MPP
        { 
            name: 'Registrasi Dokumen', href: '/register', icon: FileText, roles: ['mpp'],
            color: 'text-green-600', bgColor: 'bg-green-100' 
        },
        { 
            name: 'Penyerahan Kembali', href: '/pengembalian', icon: ArrowRightCircle, roles: ['mpp'],
            color: 'text-orange-600', bgColor: 'bg-orange-100' 
        },
        { 
            name: 'Penerimaan Hasil Perbaikan', href: '/penerimaan', icon: ClipboardList, roles: ['mpp'],
            color: 'text-purple-600', bgColor: 'bg-purple-100' 
        }, 
        { 
            name: 'Cetak Ulang', href: '/cetak-ulang', icon: Printer, roles: ['mpp'],
            color: 'text-cyan-600', bgColor: 'bg-cyan-100' 
        },

        // 3. MENU KHUSUS DLH (WARNA DISESUAIKAN)
        { 
            name: 'Registrasi Amdalnet', href: '/register-amdalnet', icon: Globe, roles: ['dlh'],
            color: 'text-emerald-600', bgColor: 'bg-emerald-100' // Tema Hijau Zamrud
        },
        { 
            name: 'Uji Administrasi', href: '/uji-administrasi', icon: FileText, roles: ['dlh'],
            color: 'text-orange-600', bgColor: 'bg-orange-100' // Tema Oranye
        },
        { 
            name: 'Verifikasi Lapangan', href: '/verifikasi-lapangan', icon: MapPin, roles: ['dlh'],
            color: 'text-green-600', bgColor: 'bg-green-100' // Tema Hijau Daun
        },
        { 
            name: 'Pemeriksaan Substansi', href: '/pemeriksaan-substansi', icon: BookOpen, roles: ['dlh'],
            color: 'text-indigo-600', bgColor: 'bg-indigo-100' // Tema Indigo/Ungu
        },
        { 
            name: 'Pemeriksaan Revisi', href: '/pemeriksaan-revisi', icon: FileEdit, roles: ['dlh'],
            color: 'text-blue-600', bgColor: 'bg-blue-100' // Tema Biru
        },
        { 
            // PERBAIKAN PATH: Sebelumnya href-nya '/verifikasi', sekarang aku ubah ke '/risalah-pengolah' sesuai routing kita
            name: 'Risalah Pengolah', href: '/risalah-pengolah', icon: FileCheck, roles: ['dlh'],
            color: 'text-rose-600', bgColor: 'bg-rose-100' // Tema Merah Muda/Rose
        },

        // 4. REKAP DATA
        { 
            name: 'Rekapitulasi Data', href: '/rekap', icon: Archive, roles: ['mpp', 'dlh'],
            color: 'text-red-600', bgColor: 'bg-red-100' // Tema Merah
        },
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
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white text-slate-600 md:hidden shadow-md border border-slate-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {isOpen && (
                <div className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
            )}

            <aside 
                className={`
                    fixed inset-y-0 left-0 z-40 w-80 bg-white text-slate-700 
                    transform md:translate-x-0 transition-transform duration-300 ease-in-out font-sans
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:shrink-0 flex flex-col h-screen print:hidden shadow-[1px_0_5px_rgba(0,0,0,0.05)]
                `}
            >
                <div className="px-6 pt-8 pb-4">
                    <h2 className="text-[22px] text-slate-600 font-normal leading-tight mb-6">
                        PERIZINAN <span className="font-medium text-slate-900">DLH</span>
                    </h2>
                    
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-slate-900 truncate">
                                {session?.user?.name || userRole}
                            </p>
                            <p className="text-sm text-slate-500 truncate capitalize">
                                {userRole === 'dlh' ? 'Dinas Lingkungan Hidup' : 'MPP Petugas'}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-2 pr-4 space-y-1">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link 
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    group flex items-center w-full pl-6 pr-4 py-3 
                                    rounded-r-full transition-all duration-200 ease-in-out
                                    ${active 
                                        ? 'bg-[#e8f0fe]' 
                                        : 'hover:bg-slate-50' 
                                    }
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0
                                    ${item.bgColor} ${item.color}
                                    ${active ? 'ring-0' : ''} 
                                `}>
                                    <item.icon size={20} strokeWidth={2.5} />
                                </div>

                                <span className={`
                                    text-[15px] tracking-wide
                                    ${active 
                                        ? 'font-medium text-blue-900' 
                                        : 'font-normal text-slate-600 group-hover:text-slate-900' 
                                    }
                                `}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-100">
                    <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center w-full pl-4 pr-4 py-3 rounded-full hover:bg-slate-100 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-slate-200">
                            <LogOut size={20} className="text-slate-600" />
                        </div>
                        <span className="text-[15px] font-medium text-slate-600">Keluar Sistem</span>
                    </button>
                    
                    <div className="mt-4 px-6 text-[11px] text-slate-400 text-center">
                        &copy; 2026 Dinas Lingkungan Hidup Kab. Sragen
                    </div>
                </div>
            </aside>
        </>
    );
}