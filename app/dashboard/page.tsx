'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, FileText, MapPin, BookOpen, 
    FileEdit, FileCheck, Loader2, ArrowRight, Activity, Clock, 
    CalendarDays, ChevronLeft, ChevronRight, X, User
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

// --- FUNGSI HELPER BARU: Mengurangi Hari Kerja untuk Hitung Mundur (H-3, H-2, dst) ---
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

// --- FUNGSI HELPER: Format Tanggal Indo ---
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

    // --- STATE KALENDER & MODAL ---
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState("");
    const [modalEvents, setModalEvents] = useState<any[]>([]);

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

                        latestDocs.forEach(doc => {
                            // Hitung Statistik
                            if (doc.nomorRisalah) selesai++;
                            else if (doc.nomorBAPemeriksaan || doc.nomorPHP) revisi++; 
                            else if (doc.nomorBAVerlap) substansi++; 
                            else if (doc.nomorUjiBerkas) verlap++; 
                            else ujiAdmin++;

                            // --- LOGIKA PERINGATAN H-3 SAMPAI DEADLINE ---
                            if (!doc.tanggalMasukDokumen) return;
                            
                            const kegiatan = doc.namaKegiatan || 'Tanpa Judul';
                            const pemrakarsa = doc.namaPemrakarsa || '-';
                            const noUrut = doc.noUrut;
                            
                            // Hitung tanggal deadline maksimal tiap tahap
                            const t1 = addWorkingDays(doc.tanggalMasukDokumen, 3); // Uji Admin (3 Hari)
                            const t2 = addWorkingDays(t1, 5); // Verlap (5 Hari)
                            const t3 = addWorkingDays(t2, 5); // BAP (5 Hari)
                            const t4 = addWorkingDays(t3, 5); // Revisi (5 Hari)
                            const t5 = addWorkingDays(t4, 5); // RPD (5 Hari)
                            
                            // Cari tahu dokumen ini sedang stuck di tahap mana, lalu tentukan target deadline-nya
                            let targetDate = '';
                            let phaseName = '';

                            if (doc.nomorRisalah) {
                                return; // Jika sudah selesai, tidak usah tampil peringatan di kalender
                            } else if (doc.nomorPHP) {
                                targetDate = t5; phaseName = 'RPD';
                            } else if (doc.nomorBAPemeriksaan) {
                                targetDate = t4; phaseName = 'Revisi';
                            } else if (doc.nomorBAVerlap) {
                                targetDate = t3; phaseName = 'BAP';
                            } else if (doc.nomorUjiBerkas) {
                                targetDate = t2; phaseName = 'Verlap';
                            } else {
                                targetDate = t1; phaseName = 'Admin';
                            }

                            // Buat fungsi untuk bikin event pengingat
                            const pushEvent = (dateStr: string, color: string, prefix: string) => {
                                events.push({
                                    date: dateStr, type: phaseName, kegiatan, pemrakarsa, noUrut, color, prefix, 
                                    title: `${prefix} ${phaseName}: ${kegiatan}`
                                });
                            };

                            // Menambahkan 4 Event Alarm ke Kalender!
                            // Hijau (H-3)
                            pushEvent(subtractWorkingDays(targetDate, 3), 'bg-emerald-100 text-emerald-800 border-emerald-300', 'H-3');
                            // Kuning (H-2)
                            pushEvent(subtractWorkingDays(targetDate, 2), 'bg-yellow-100 text-yellow-800 border-yellow-300', 'H-2');
                            // Merah Muda (H-1)
                            pushEvent(subtractWorkingDays(targetDate, 1), 'bg-red-100 text-red-800 border-red-300', 'H-1');
                            // Merah Solid (DEADLINE)
                            pushEvent(targetDate, 'bg-red-600 text-white font-bold shadow-md border-red-700', 'DEADLINE');

                        });

                        setStats({ total: latestDocs.length, ujiAdmin, verlap, substansi, revisi, selesai, tahunTerbaru: latestYear });
                        setCalendarEvents(events);
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

    // --- LOGIKA PEMBUATAN GRID KALENDER ---
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
            setModalDate(dateStr);
            setModalEvents(dayEvents);
            setModalOpen(true);
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
                <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Activity size={18} className="text-blue-500" />
                    Total {stats.total} Dokumen di Tahun {stats.tahunTerbaru}
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
                        <Clock className="text-blue-500" size={20} /> Aktivitas Terbaru ({stats.tahunTerbaru})
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
                            {dataDokumen.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Belum ada dokumen yang terdaftar.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KALENDER PENGINGAT DEADLINE (SLA GRID) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/80 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CalendarDays className="text-blue-600" size={22} /> Kalender Pengingat SLA
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Hitung mundur batas waktu dokumen aktif (Hijau: H-3, Kuning: H-2, Merah Muda: H-1, Merah Solid: Deadline).</p>
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
                            
                            // Urutkan event di hari tersebut agar DEADLINE (H-0) selalu tampil di atas
                            const dayEvents = calendarEvents
                                .filter(e => e.date === currentDateStr)
                                .sort((a, b) => {
                                    if (a.prefix === 'DEADLINE') return -1;
                                    if (b.prefix === 'DEADLINE') return 1;
                                    return a.prefix > b.prefix ? -1 : 1; 
                                });
                            
                            const todayLocal = new Date();
                            const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;
                            const isToday = currentDateStr === todayStr;

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => handleDayClick(currentDateStr, dayEvents)}
                                    className={`min-h-[110px] border rounded-xl p-2 transition-all duration-200 ${isToday ? 'bg-blue-50/30 border-blue-400 shadow-sm ring-1 ring-blue-400' : 'bg-white border-gray-200'} ${dayEvents.length > 0 ? 'cursor-pointer hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5' : ''}`}
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

            {/* MODAL NOTIFIKASI DETAIL KALENDER */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-lg flex items-center gap-2">
                                    <CalendarDays className="text-blue-600" size={22}/>
                                    Notifikasi Tenggat Waktu
                                </h3>
                                <p className="text-sm text-gray-500 font-medium mt-0.5 ml-8">
                                    {formatDateIndo(modalDate)}
                                </p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50/50">
                            {modalEvents.map((ev, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex flex-col gap-2 shadow-sm ${ev.prefix === 'DEADLINE' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${ev.prefix === 'DEADLINE' ? 'bg-red-600 text-white' : ev.color}`}>
                                                {ev.prefix}
                                            </span>
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                                                Tahap {ev.type}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">No. {ev.noUrut}</span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-800 leading-snug mt-1">{ev.kegiatan}</p>
                                    <div className="pt-2 mt-1 border-t border-black/5">
                                        <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                            <User size={12}/> {ev.pemrakarsa}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                            <button onClick={() => setModalOpen(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}