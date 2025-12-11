'use client'; // Opsional, tapi aman untuk komponen UI interaktif

import React from 'react';

// 1. Definisi Tipe Data Props (Wajib di TypeScript)
interface ModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// 2. CSS Styles (Tetap menggunakan string CSS seperti keinginan Anda)
const modalStyles = `
    /* Latar belakang gelap (overlay) */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    }

    /* Kotak konten modal */
    .modal-content {
        background: #ffffff;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        z-index: 1001;
        transform: translateY(-20px);
        animation: slideIn 0.3s forwards;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }

    .modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
    }

    .modal-close-button {
        background: none;
        border: none;
        font-size: 2rem;
        font-weight: 300;
        line-height: 1;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
    }
    .modal-close-button:hover {
        color: #000;
    }

    .modal-body {
        font-size: 1rem;
        color: #374151;
        line-height: 1.6;
        white-space: pre-wrap; /* PENTING: Agar \n dari backend terbaca sebagai baris baru */
    }

    .modal-footer {
        text-align: right;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }

    /* Animasi sederhana */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

// 3. Komponen Utama dengan Tipe Data
const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Render CSS dalam tag style (Scoped sederhana) */}
            <style>{modalStyles}</style>
            
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">{title}</h4>
                    <button onClick={onClose} className="modal-close-button">&times;</button>
                </div>
                
                <div className="modal-body">
                    {children}
                </div>
                
                <div className="modal-footer">
                    {/* Menggunakan class Tailwind untuk tombol agar konsisten */}
                    <button 
                        onClick={onClose} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;