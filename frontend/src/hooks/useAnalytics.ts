import { useMemo } from 'react';
import { useCategories } from './useCategories';

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

interface Analytics {
    totalSent: number;
    totalReceived: number;
    byType: {
        sent: number;
        received: number;
    };
    byMonth: Record<string, number>;
    byCategory: Record<string, number>;
}

export const useAnalytics = (transfers: Transfer[], currentUserId: number): Analytics => {
    const { categories, getCategoryName } = useCategories();

    return useMemo(() => {
        let totalSent = 0;
        let totalReceived = 0;
        const byType = { sent: 0, received: 0 };
        const byMonth: Record<string, number> = {};
        const byCategory: Record<string, number> = {};

        transfers.forEach((transfer) => {
            const amount = parseFloat(transfer.amount.toString());
            const date = new Date(transfer.created_at);
            const monthKey = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

            if (transfer.sender_id === currentUserId) {
                totalSent += amount;
                byType.sent += 1;
            } else if (transfer.receiver_id === currentUserId) {
                totalReceived += amount;
                byType.received += 1;
            }

            byMonth[monthKey] = (byMonth[monthKey] || 0) + amount;

            // Utiliser le nom de la catégorie au lieu de l'ID
            const categoryName = getCategoryName(transfer.category_id);
            byCategory[categoryName] = (byCategory[categoryName] || 0) + amount;
        });

        return {
            totalSent,
            totalReceived,
            byType,
            byMonth,
            byCategory,
        };
    }, [transfers, currentUserId, categories, getCategoryName]);
};