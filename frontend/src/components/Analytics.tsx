import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import '../styles/components/analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Transfer {
    id: number;
    sender_id: number;
    receiver_id: number;
    amount: number;
    description?: string;
    status: string;
    created_at: string;
    category_id?: number;
}

interface AnalyticsModalProps {
    transfers: Transfer[];
    currentUserId: number;
    onClose: () => void;
}

type ChartType = 'overview' | 'byType' | 'byMonth' | 'byCategory';

export default function Analytics({ transfers, currentUserId, onClose }: AnalyticsModalProps) {
    const [activeChart, setActiveChart] = useState<ChartType>('overview');
    const analytics = useAnalytics(transfers, currentUserId);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'var(--current-text-primary)',
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: true,
                color: 'var(--current-text-primary)',
                font: {
                    size: 14,
                    weight: 'bold',
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    color: 'var(--current-text-secondary)',
                },
                grid: {
                    color: 'var(--current-border-color)',
                },
            },
            x: {
                ticks: {
                    color: 'var(--current-text-secondary)',
                },
                grid: {
                    color: 'var(--current-border-color)',
                },
            },
        },
    };

    // GRAPHIQUE 1 : Vue d'ensemble (Pie)
    const overviewData = {
        labels: [`Envoyés (${analytics.byType.sent})`, `Reçus (${analytics.byType.received})`],
        datasets: [
            {
                data: [analytics.byType.sent, analytics.byType.received],
                backgroundColor: ['rgba(220, 53, 69, 0.7)', 'rgba(40, 167, 69, 0.7)'],
                borderColor: ['#dc3545', '#28a745'],
                borderWidth: 2,
            },
        ],
    };

    // GRAPHIQUE 2 : Par type (Bar)
    const byTypeData = {
        labels: ['Virements Envoyés', 'Virements Reçus'],
        datasets: [
            {
                label: 'Nombre de transactions',
                data: [analytics.byType.sent, analytics.byType.received],
                backgroundColor: ['rgba(220, 53, 69, 0.6)', 'rgba(40, 167, 69, 0.6)'],
                borderColor: ['#dc3545', '#28a745'],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    // GRAPHIQUE 3 : Par mois (Line)
    const monthKeys = Object.keys(analytics.byMonth);
    const byMonthData = {
        labels: monthKeys,
        datasets: [
            {
                label: 'Montant total par mois',
                data: monthKeys.map((month) => analytics.byMonth[month]),
                borderColor: 'var(--primary-accent)',
                backgroundColor: 'rgba(118, 79, 105, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'var(--primary-accent)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    // GRAPHIQUE 4 : Par catégorie (Doughnut)
    const categoryKeys = Object.keys(analytics.byCategory);
    const categoryColors = [
        'rgba(118, 79, 105, 0.7)',
        'rgba(191, 209, 229, 0.7)',
        'rgba(220, 53, 69, 0.7)',
        'rgba(40, 167, 69, 0.7)',
        'rgba(255, 193, 7, 0.7)',
    ];

    const byCategoryData = {
        labels: categoryKeys,
        datasets: [
            {
                data: categoryKeys.map((cat) => analytics.byCategory[cat]),
                backgroundColor: categoryColors.slice(0, categoryKeys.length),
                borderColor: categoryColors.slice(0, categoryKeys.length).map((c) => c.replace('0.7', '1')),
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="analytics-modal-overlay" onClick={onClose}>
            <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="analytics-header">
                    <h2>Analyse des virements</h2>
                    <button className="analytics-close-btn" onClick={onClose} aria-label="Fermer">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="analytics-tabs">
                    <button
                        className={`analytics-tab ${activeChart === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveChart('overview')}
                    >
                        <i className="fas fa-chart-pie"></i>
                        Vue globale
                    </button>
                    <button
                        className={`analytics-tab ${activeChart === 'byType' ? 'active' : ''}`}
                        onClick={() => setActiveChart('byType')}
                    >
                        <i className="fas fa-exchange-alt"></i>
                        Par type
                    </button>
                    <button
                        className={`analytics-tab ${activeChart === 'byMonth' ? 'active' : ''}`}
                        onClick={() => setActiveChart('byMonth')}
                    >
                        <i className="fas fa-calendar-alt"></i>
                        Par mois
                    </button>
                    {categoryKeys.length > 0 && (
                        <button
                            className={`analytics-tab ${activeChart === 'byCategory' ? 'active' : ''}`}
                            onClick={() => setActiveChart('byCategory')}
                        >
                            <i className="fas fa-tags"></i>
                            Par catégorie
                        </button>
                    )}
                </div>

                <div className="analytics-chart-container">
                    {activeChart === 'overview' && (
                        <div className="analytics-chart">
                            <Pie data={overviewData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Répartition des virements' } } }} />
                        </div>
                    )}

                    {activeChart === 'byType' && (
                        <div className="analytics-chart">
                            <Bar
                                data={byTypeData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: true, text: 'Nombre de virements par type' },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {activeChart === 'byMonth' && (
                        <div className="analytics-chart">
                            <Line
                                data={byMonthData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: true, text: 'Montants par mois' },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {activeChart === 'byCategory' && categoryKeys.length > 0 && (
                        <div className="analytics-chart">
                            <Doughnut
                                data={byCategoryData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        title: { display: true, text: 'Répartition par catégorie' },
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="analytics-stats">
                    <div className="stat-item">
                        <p className="stat-label">Total envoyé</p>
                        <p className="stat-value sent">{analytics.totalSent.toFixed(2)} €</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Total reçu</p>
                        <p className="stat-value received">{analytics.totalReceived.toFixed(2)} €</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Nombre total</p>
                        <p className="stat-value">{transfers.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}