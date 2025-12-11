'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const summaryStyles = `
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }
    .summary-card {
        background-color: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: transform 0.2s;
    }
    .summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .summary-card-value {
        font-size: 2.5rem; 
        font-weight: 800;
        color: #2563eb;
        margin: 0;
        line-height: 1.2;
    }
    .summary-card-label {
        font-size: 0.95rem;
        color: #64748b;
        margin-top: 0.5rem;
        font-weight: 600;
    }
    .year-filter-wrapper {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.5rem;
    }
    .year-filter {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
    }
    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: 1fr;
        }
    }
`;

interface SummaryData {
    totalMasuk: number;
    totalUjiAdmin: number;
    totalVerlap: number;
    totalPemeriksaan: number;
    totalPerbaikan: number;
    totalRPD: number;
}

interface Props {
    selectedYear: string;
    setSelectedYear: (year: string) => void;
}

export default function SummaryDashboard({ selectedYear, setSelectedYear }: Props) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            try {
                // Fetch data from the new endpoint
                const response = await api.get(`/dashboard/summary?year=${selectedYear}`);
                setSummary(response.data.data);
            } catch (error) {
                console.error("Gagal mengambil data summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaryData();
    }, [selectedYear]);

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        // Generate years from current year down to 2024
        for (let i = currentYear; i >= 2024; i--) { years.push(i); }
        
        return years.map(year => (
            <option key={year} value={year}>{year}</option>
        ));
    };

    const summaryItems = [
        { label: "Dokumen Masuk", value: summary?.totalMasuk },
        { label: "BA Hasil Uji Administrasi", value: summary?.totalUjiAdmin },
        { label: "BA Verifikasi Lapangan", value: summary?.totalVerlap },
        { label: "BA Pemeriksaan", value: summary?.totalPemeriksaan },
        { label: "BA Perbaikan (PHP)", value: summary?.totalPerbaikan }, // PHP
        { label: "Risalah Pengolah Data", value: summary?.totalRPD },
    ];

    return (
        <div>
            <style jsx>{summaryStyles}</style>
            
            <div className="year-filter-wrapper">
                <div className="year-filter">
                    <label htmlFor="year-select" className="font-semibold text-gray-700">Tahun:</label>
                    <select 
                        id="year-select" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="border-none bg-transparent font-bold text-blue-600 focus:ring-0 cursor-pointer outline-none"
                    >
                        {generateYearOptions()}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Memuat statistik...</div>
            ) : (
                <div className="summary-grid">
                    {summaryItems.map((item, index) => (
                        <div className="summary-card" key={index}>
                            <p className="summary-card-value">
                                {item.value !== undefined ? item.value : 0}
                            </p>
                            <p className="summary-card-label">{item.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}