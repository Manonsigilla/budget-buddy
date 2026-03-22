import { useMemo } from 'react';

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

interface AnalyticsData {
    byType: {
        sent: number;
        received: number;
    };
    byCategory: {
        [key: string]: number;
    };
    byMonth: {
        [key: string]: number;
    };
    totalSent: number;
    totalReceived: number;
}

export const useAnalytics = (transfers: Transfer[], currentUserId: number) => {
    return useMemo(() => {
        const analytics: AnalyticsData = {
            byType: { sent: 0, received: 0 },
            byCategory: {},
            byMonth: {},
            totalSent: 0,
            totalReceived: 0,
        };

        transfers.forEach((transfer) => {
            const amount = parseFloat(transfer.amount.toString());

            // Données par type
            if (transfer.sender_id === currentUserId) {
                analytics.byType.sent += 1;
                analytics.totalSent += amount;
            } else {
                analytics.byType.received += 1;
                analytics.totalReceived += amount;
            }

            // Données par catégorie (si disponible)
            if (transfer.category_id) {
                const categoryName = `Catégorie ${transfer.category_id}`;
                analytics.byCategory[categoryName] = (analytics.byCategory[categoryName] || 0) + amount;
            }

            // Données par mois
            const date = new Date(transfer.created_at);
            const monthKey = `${date.toLocaleString('fr-FR', { month: 'long' })} ${date.getFullYear()}`;
            analytics.byMonth[monthKey] = (analytics.byMonth[monthKey] || 0) + amount;
        });

        return analytics;
    }, [transfers, currentUserId]);
};