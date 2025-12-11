import Link from 'next/link';
import { AlertTriangle, Home, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      
      <div className="text-center max-w-lg">
        
        {/* Ikon Besar */}
        <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="text-orange-500 w-12 h-12" />
            </div>
        </div>
        
        {/* Kode Error Besar */}
        <h1 className="text-8xl font-extrabold text-green-800 tracking-widest mb-2">
          404
        </h1>
        
        {/* Pesan Judul */}
        <div className="mb-6">
          <p className="text-2xl font-bold text-slate-700 uppercase tracking-wide">
            Halaman Tidak Ditemukan
          </p>
        </div>
        
        {/* Deskripsi */}
        <p className="mb-8 text-lg text-slate-500 leading-relaxed">
          Mohon maaf, halaman yang Anda cari mungkin telah dihapus, namanya diganti, atau Anda tidak memiliki akses ke halaman tersebut.
        </p>

        {/* Tombol Aksi (Sudah diperbaiki tanpa legacyBehavior) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          
          <Link 
            href="/" 
            className="flex items-center justify-center px-6 py-3 bg-green-700 text-white font-bold rounded-xl shadow-md hover:bg-green-800 transition duration-300 hover:shadow-lg hover:shadow-green-500/30"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </Link>
          
          <Link 
            href="/rekap" 
            className="flex items-center justify-center px-6 py-3 border border-slate-300 bg-white text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition duration-300"
          >
            <FileText className="w-5 h-5 mr-2" />
            Lihat Rekap Data
          </Link>

        </div>
      </div>
      
    </div>
  );
}