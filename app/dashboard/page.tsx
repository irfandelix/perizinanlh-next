'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, FileText, MapPin, BookOpen, 
    FileEdit, FileCheck, Loader2, ArrowRight, Activity, Clock, 
    CalendarDays, ChevronLeft, ChevronRight, X, User, BellRing, CheckCircle
} from 'lucide-react';

interface Dokumen {
    _id: string;
    noUrut: number;
    nomorChecklist: string;
    namaPemrakarsa: string;
    namaKegiatan: string;
    jenisDokumen: string;
    tanggalMasukDokumen: string;
    statusTerakhir: string;
    tahun?: string | number;
    nomorUjiBerkas?: string; 
    nomorBAVerlap?: string;     
    nomorBAPemeriksaan?: string; 
    nomorPHP?: string;
    nomorRisalah?: string;
    // TAMBAHAN: Kita butuh data tanggal dari masing-masing tahap untuk hitung SLA yang akurat
    tanggalPenerbitanUa?: string;
    tanggalVerlap?: string;
    tanggalPemeriksaan?: string;
    tanggalRevisi?: string;
}

// --- FUNGSI HELPER: Menambah Hari Kerja (Skip Sabtu & Minggu) ---
const addWorkingDays = (startDateStr: string, daysToAdd: number) => {
    let currentDate = new Date(startDateStr);
    let addedDays = 0;
    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Minggu, 6 = Sabtu
            addedDays++;
        }
    }
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// --- FUNGSI HELPER: Mengurangi Hari Kerja untuk Hitung Mundur (H-3, H-2, dst) ---
const subtractWorkingDays = (startDateStr: string, daysToSubtract: number) => {
    let currentDate = new Date(startDateStr);
    let subtractedDays = 0;
    while (subtractedDays < daysToSubtract) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Minggu, 6 = Sabtu
            subtractedDays++;
        }
    }
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateIndo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function DashboardPage() {
    const [dataDokumen, setDataDokumen] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total: 0, ujiAdmin: 0, verlap: 0, substansi: 0, revisi: 0, selesai: 0, tahunTerbaru: ''
    });

    // --- STATE KALENDER & MODAL TANGGAL ---
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [modalCalOpen, setModalCalOpen] = useState(false);
    const [modalCalDate, setModalCalDate] = useState("");
    const [modalCalEvents, setModalCalEvents] = useState<any[]>([]);

    // --- STATE NOTIFIKASI TUGAS (MUNCUL SAAT LOGIN) ---
    const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
    const [showNotifModal, setShowNotifModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/record/list'); 
                const result = await res.json();
                
                if (result.success) {
                    const docs: Dokumen[] = result.data;
                    
                    if (docs.length > 0) {
                        const allYears = docs.map(doc => parseInt(doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : new Date().getFullYear().toString())));
                        const latestYear = Math.max(...allYears.filter(y => !isNaN(y))).toString();

                        const latestDocs = docs.filter(doc => {
                            const docYear = doc.tahun?.toString() || (doc.tanggalMasukDokumen ? doc.tanggalMasukDokumen.substring(0, 4) : '');
                            return docYear === latestYear;
                        });

                        const sortedDocs = latestDocs.sort((a, b) => b.noUrut - a.noUrut);
                        setDataDokumen(sortedDocs);

                        let ujiAdmin = 0, verlap = 0, substansi = 0, revisi = 0, selesai = 0;
                        const events: any[] = [];
                        const urgents: any[] = [];
                        
                        const todayLocal = new Date();
                        const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

                        latestDocs.forEach(doc => {
                            // Hitung Statistik
                            if (doc.nomorRisalah) selesai++;
                            else if (doc.nomorBAPemeriksaan || doc.nomorPHP) revisi++; 
                            else if (doc.nomorBAVerlap) substansi++; 
                            else if (doc.nomorUjiBerkas) verlap++; 
                            else ujiAdmin++;

                            // --- LOGIKA SLA DEADLINE YANG SUDAH DIPERBAIKI ---
                            if (!doc.tanggalMasukDokumen) return;
                            
                            const kegiatan = doc.namaKegiatan || 'Tanpa Judul';
                            const pemrakarsa = doc.namaPemrakarsa || '-';
                            const noUrut = doc.noUrut;
                            
                            // Hitung target tanggal berdasarkan riwayat tanggal yang SEBENARNYA diselesaikan
                            const tAdmin = addWorkingDays(doc.tanggalMasukDokumen, 3); 
                            const dateUjiAdmin = doc.tanggalPenerbitanUa || tAdmin;
                            
                            const tVerlap = addWorkingDays(dateUjiAdmin, 5); 
                            const dateVerlap = doc.tanggalVerlap || tVerlap;
                            
                            const tBap = addWorkingDays(dateVerlap, 5); 
                            const dateBap = doc.tanggalPemeriksaan || tBap; // <--- Di sini sistem akan membaca 27 Feb milikmu
                            
                            const tRevisi = addWorkingDays(dateBap, 5); 
                            const dateRevisi = doc.tanggalRevisi || tRevisi;
                            
                            const tRpd = addWorkingDays(dateRevisi, 5); 
                            
                            let targetDate = '';
                            let phaseName = '';

                            if (doc.nomorRisalah) {
                                return; // Selesai, skip
                            } else if (doc.nomorPHP) {
                                targetDate = tRpd; phaseName = 'RPD';
                            } else if (doc.nomorBAPemeriksaan) {
                                targetDate = tRevisi; phaseName = 'Revisi';
                            } else if (doc.nomorBAVerlap) {
                                targetDate = tBap; phaseName = 'BAP';
                            } else if (doc.nomorUjiBerkas) {
                                targetDate = tVerlap; phaseName = 'Verlap';
                            } else {
                                targetDate = tAdmin; phaseName = 'Uji Admin';
                            }

                            // 1. MASUKKAN KE KALENDER (Hanya Hari Maksimal / DEADLINE saja)
                            events.push({
                                date: targetDate, type: phaseName, kegiatan, pemrakarsa, noUrut, 
                                color: 'bg-red-50 text-red-700 border-red-200 font-bold', prefix: 'BATAS MAKS', 
                                title: `Batas ${phaseName}: ${kegiatan}`
                            });

                            // 2. MASUKKAN KE DAFTAR NOTIFIKASI TUGAS (H-3 sampai Deadline)
                            const h1 = subtractWorkingDays(targetDate, 1);
                            const h2 = subtractWorkingDays(targetDate, 2);
                            const h3 = subtractWorkingDays(targetDate, 3);

                            let notifLevel = '';
                            let notifColor = '';
                            let urgencyScore = 0;

                            if (todayStr > targetDate) {
                                notifLevel = 'TERLEWAT / OVERDUE'; notifColor = 'bg-red-600 text-white'; urgencyScore = 5;
                            } else if (todayStr === targetDate) {
                                notifLevel = 'DEADLINE HARI INI'; notifColor = 'bg-red-500 text-white animate-pulse'; urgencyScore = 4;
                            } else if (todayStr === h1) {
                                notifLevel = 'H-1 (Besok Maksimal)'; notifColor = 'bg-orange-100 text-orange-800 border-orange-300'; urgencyScore = 3;
                            } else if (todayStr === h2) {
                                notifLevel = 'H-2 (Awas)'; notifColor = 'bg-yellow-100 text-yellow-800 border-yellow-300'; urgencyScore = 2;
                            } else if (todayStr === h3) {
                                notifLevel = 'H-3 (Mulai Kerjakan)'; notifColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'; urgencyScore = 1;
                            }

                            if (notifLevel !== '') {
                                urgents.push({
                                    noUrut, kegiatan, pemrakarsa, phaseName, notifLevel, notifColor, urgencyScore, targetDate
                                });
                            }
                        });

                        setStats({ total: latestDocs.length, ujiAdmin, verlap, substansi, revisi, selesai, tahunTerbaru: latestYear });
                        setCalendarEvents(events);
                        
                        const sortedUrgents = urgents.sort((a, b) => b.urgencyScore - a.urgencyScore);
                        setUrgentTasks(sortedUrgents);
                        
                        if (sortedUrgents.length > 0) {
                            setShowNotifModal(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, count, icon: Icon, colorClass, bgIconClass, link }: any) => (
        <Link href={link} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all group flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 group-hover:scale-105 transition-transform transform origin-left">{count}</h3>
            </div>
            <div className={`p-4 rounded-full ${bgIconClass} ${colorClass} transition-colors`}>
                <Icon size={26} strokeWidth={2.5} />
            </div>
        </Link>
    );

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthName = currentMonth.toLocaleString('id-ID', { month: 'long' });
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); 

    const calendarDays: (number | null)[] = [
        ...Array.from({ length: firstDayIndex }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    const handleDayClick = (dateStr: string, dayEvents: any[]) => {
        if (dayEvents.length > 0) {
            setModalCalDate(dateStr);
            setModalCalEvents(dayEvents);
            setModalCalOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Menyiapkan Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-20">
            
            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
                            <LayoutDashboard className="text-white w-6 h-6" />
                        </div>
                        Dashboard Perizinan
                    </h1>
                    <p className="text-gray-500 mt-2 ml-14 font-medium">
                        Ringkasan aktivitas dan status dokumen lingkungan hidup terkini.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowNotifModal(true)}
                        className="relative p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        title="Lihat Tugas Harian"
                    >
                        <BellRing size={20} className={urgentTasks.length > 0 ? "text-red-500" : "text-gray-400"} />
                        {urgentTasks.length > 0 && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                        )}
                    </button>

                    <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Activity size={18} className="text-blue-500" />
                        Total {stats.total} Dokumen ({stats.tahunTerbaru})
                    </div>
                </div>
            </div>

            {/* METRIK STATISTIK GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                <StatCard title="Uji Admin" count={stats.ujiAdmin} icon={FileText} link="/uji-administrasi" colorClass="text-orange-600" bgIconClass="bg-orange-50 group-hover:bg-orange-100" />
                <StatCard title="Verifikasi Lpg" count={stats.verlap} icon={MapPin} link="/verifikasi-lapangan" colorClass="text-green-600" bgIconClass="bg-green-50 group-hover:bg-green-100" />
                <StatCard title="Pemeriksaan" count={stats.substansi} icon={BookOpen} link="/pemeriksaan-substansi" colorClass="text-indigo-600" bgIconClass="bg-indigo-50 group-hover:bg-indigo-100" />
                <StatCard title="Revisi" count={stats.revisi} icon={FileEdit} link="/pemeriksaan-revisi" colorClass="text-blue-600" bgIconClass="bg-blue-50 group-hover:bg-blue-100" />
                <StatCard title="Selesai / RPD" count={stats.selesai} icon={FileCheck} link="/risalah-pengolah" colorClass="text-rose-600" bgIconClass="bg-rose-50 group-hover:bg-rose-100" />
            </div>

            {/* TABEL AKTIVITAS TERBARU */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="text-blue-500" size={20} /> Aktivitas Terbaru
                    </h3>
                    <Link href="/rekap" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                        Lihat Semua <ArrowRight size={16} />
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-4 w-16 text-center">No</th>
                                <th className="p-4">Tanggal Masuk</th>
                                <th className="p-4">Nama Kegiatan</th>
                                <th className="p-4">Jenis</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {dataDokumen.slice(0, 5).map((doc) => (
                                <tr key={doc._id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 text-center font-bold text-gray-600">{doc.noUrut}</td>
                                    <td className="p-4 text-gray-500 font-medium whitespace-nowrap">{doc.tanggalMasukDokumen}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 line-clamp-1">{doc.namaKegiatan || "(Tanpa Judul)"}</div>
                                        <div className="font-mono text-[11px] text-gray-400 mt-0.5">{doc.namaPemrakarsa}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-extrabold tracking-wide whitespace-nowrap">
                                            {doc.jenisDokumen}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-bold whitespace-nowrap uppercase tracking-wider">
                                            {doc.statusTerakhir || 'PROSES'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KALENDER TENGGAT WAKTU */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/80 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CalendarDays className="text-blue-600" size={22} /> Kalender Batas Maksimal SLA
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Hanya menampilkan hari terakhir batas penyelesaian dokumen aktif.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft size={20}/></button>
                        <span className="font-bold text-slate-800 w-32 text-center capitalize">{monthName} {year}</span>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight size={20}/></button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
                            <div key={day} className={`text-center text-xs font-bold py-2 ${i === 0 || i === 6 ? 'text-red-500 bg-red-50 rounded' : 'text-slate-500'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="min-h-[110px] bg-slate-50/50 rounded-xl border border-dashed border-gray-200"></div>;
                            }

                            const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = calendarEvents.filter(e => e.date === currentDateStr);
                            
                            const todayLocal = new Date();
                            const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;
                            const isToday = currentDateStr === todayStr;

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => handleDayClick(currentDateStr, dayEvents)}
                                    className={`min-h-[110px] border rounded-xl p-2 transition-all duration-200 ${isToday ? 'bg-blue-50/30 border-blue-400 shadow-sm ring-1 ring-blue-400' : 'bg-white border-gray-200'} ${dayEvents.length > 0 ? 'cursor-pointer hover:shadow-md hover:border-red-300 hover:-translate-y-0.5' : ''}`}
                                >
                                    <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                                        {day}
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        {dayEvents.slice(0, 3).map((ev, idx) => (
                                            <div key={idx} className={`text-[10px] px-1.5 py-1 rounded border leading-tight line-clamp-1 shadow-sm ${ev.color}`}>
                                                {ev.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] font-bold text-gray-500 pl-1 pt-0.5 hover:text-blue-600">+ {dayEvents.length - 3} dokumen</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- MODAL DAFTAR NOTIFIKASI TUGAS --- */}
            {showNotifModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] transform transition-all scale-100">
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50/80">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-xl flex items-center gap-2">
                                    <BellRing className="text-red-500" size={24} /> Peringatan Tugas Harian
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Daftar dokumen yang mendekati batas SLA dan harus segera dikerjakan.
                                </p>
                            </div>
                            <button onClick={() => setShowNotifModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors bg-white shadow-sm border border-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
                            {urgentTasks.length === 0 ? (
                                <div className="text-center py-10">
                                    <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-gray-700">Tidak ada tugas mendesak!</h4>
                                    <p className="text-gray-500 text-sm mt-1">Semua dokumen aman dan masih jauh dari batas SLA.</p>
                                </div>
                            ) : (
                                urgentTasks.map((task, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${task.notifColor} border ${task.notifColor.includes('text-white') ? 'border-red-700' : ''}`}>
                                                    {task.notifLevel}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                    Tahap {task.phaseName}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-sm leading-snug">{task.kegiatan}</h4>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <User size={12} /> {task.pemrakarsa}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">No Urut: {task.noUrut}</p>
                                            <p className="text-xs font-bold text-gray-800 mt-1">Target Maksimal:</p>
                                            <p className={`text-sm font-extrabold ${task.urgencyScore >= 4 ? 'text-red-600' : 'text-gray-600'}`}>
                                                {formatDateIndo(task.targetDate)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
                            <button onClick={() => setShowNotifModal(false)} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-200">
                                Mengerti, Tutup Notifikasi
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL KLIK TANGGAL KALENDER */}
            {modalCalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                                    <CalendarDays className="text-blue-600" size={22}/>
                                    Batas SLA Dokumen
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-0.5 ml-8">
                                    {formatDateIndo(modalCalDate)}
                                </p>
                            </div>
                            <button onClick={() => setModalCalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50/50">
                            {modalCalEvents.map((ev, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col gap-2 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white">
                                                {ev.prefix}
                                            </span>
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-gray-200">
                                                Tahap {ev.type}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">No. {ev.noUrut}</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-800 leading-snug mt-1">{ev.kegiatan}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button onClick={() => setModalCalOpen(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}