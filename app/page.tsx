'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Pengganti useNavigate
import { signIn } from 'next-auth/react'; // NextAuth
import { Leaf, Lock, User } from 'lucide-react'; // Ikon

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Menggunakan NextAuth signIn
        const res = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Username atau Password salah.');
            setLoading(false);
        } else {
            // Redirect ke root, middleware akan mengarahkan ke dashboard spesifik role
            router.push('/dashboard'); 
            router.refresh();
        }
    };

    return (
        // Kunci Centering: w-screen h-screen dan flex-center
        <div 
            className="flex items-center justify-center w-screen h-screen" 
            style={{ 
                // Latar belakang gradien
                backgroundImage: 'linear-gradient(to bottom right, #f0fdf4, #e0f2f1)', 
                overflow: 'hidden' // Amankan dari scroll di wrapper ini
            }}
        > 
            {/* Kotak Login */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center"> 

                {/* Ikon */}
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-green-500/50">
                    <Leaf size={32} /> 
                </div>

                <h2 className="text-2xl font-bold text-slate-800">Login Aplikasi</h2>
                <p className="text-sm text-slate-500 mb-6">Silakan masukkan username dan password Anda.</p>
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center font-medium mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-slate-700 block text-left mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                id="username"
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                placeholder="Username"
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-700 block text-left mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="Password"
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Memproses...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} DLH Kabupaten Sragen
                    </p>
                </div>
            </div>
        </div>
    );
}