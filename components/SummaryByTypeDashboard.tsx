'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const summaryByTypeStyles = `
    .summary-by-type-card {
        background-color: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .summary-by-type-card h4 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #1f2937;
        font-weight: 700;
        font-size: 1.1rem;
    }
    .summary-by-type-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* 4 Kolom */
        gap: 1rem;
    }
    .summary-item-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .summary-item-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border-color: #cbd5e1;
    }
    .summary-item-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: #2563eb; /* Primary Blue */
        margin: 0;
        line-height: 1;
    }
    .summary-item-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
        margin-top: 0.5rem;
        text-align: center;
        text-transform: uppercase;
    }
    
    /* Responsif untuk layar kecil */
    @media (max-width: 768px) {
        .summary-by-type-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;

interface SummaryItem {
    _id: string; // Ini berisi kode dokumen (SPPL, PERTEK.AL, dll)
    count: number;
}

export default function SummaryByTypeDashboard({ selectedYear }: { selectedYear: string }) {
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/dashboard/summary/by-type?year=${selectedYear}`);
                setSummary(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data summary per jenis:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [selectedYear]);

    // Mapping Kode DB ke Label yang Enak Dibaca
    // Kiri: Kode di Database (sesuai POST route), Kanan: Label di Layar
    const docTypesConfig = [
        { code: 'SPPL', label: 'SPPL' },
        { code: 'UKLUPL', label: 'UKL-UPL' },
        { code: 'AMDAL', label: 'AMDAL' },
        { code: 'DELH', label: 'DELH' },
        { code: 'DPLH', label: 'DPLH' },
        { code: 'RINTEK.LB3', label: 'Rintek LB3' },
        { code: 'PERTEK.AL', label: 'Pertek Air Limbah' },
        { code: 'PERTEK.EM', label: 'Pertek Emisi' },
        { code: 'SLO', label: 'SLO' },
    ];

    const getCount = (code: string) => {
        // Cari data berdasarkan _id yang cocok dengan code
        const item = summary.find(s => s._id === code);
        return item ? item.count : 0;
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Memuat data...</div>;
    }

    return (
        <div className="summary-by-type-card">
            <style jsx>{summaryByTypeStyles}</style>
            <h4>Dokumen Masuk Per Jenis ({selectedYear})</h4>
            
            <div className="summary-by-type-grid">
                {docTypesConfig.map((item) => (
                    <div className="summary-item-card" key={item.code}>
                        <p className="summary-item-value">{getCount(item.code)}</p>
                        <p className="summary-item-label">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}