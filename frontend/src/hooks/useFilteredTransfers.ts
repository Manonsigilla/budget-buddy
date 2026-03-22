import { useState, useCallback } from 'react';
import api from '../api';

interface Transfer {
    id: number;
    sender_id: number;
    receiver_id: number;
    amount: number;
    description?: string;
    status: string;
    created_at: string;
    category_id?: number;
    sender_first?: string;
    sender_last?: string;
    receiver_first?: string;
    receiver_last?: string;
}

interface Filters {
    date?: string;
    date_start?: string;
    date_end?: string;
    category_id?: string;
    type?: string;
    sort?: string;
}

export const useFilteredTransfers = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({});

    const fetchTransfers = useCallback(async (appliedFilters: Filters) => {
        setIsLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            
            if (appliedFilters.date) queryParams.append('date', appliedFilters.date);
            if (appliedFilters.date_start) queryParams.append('date_start', appliedFilters.date_start);
            if (appliedFilters.date_end) queryParams.append('date_end', appliedFilters.date_end);
            if (appliedFilters.category_id) queryParams.append('category_id', appliedFilters.category_id);
            if (appliedFilters.type) queryParams.append('type', appliedFilters.type);
            if (appliedFilters.sort) queryParams.append('sort', appliedFilters.sort);

            const response = await api.get(`/transfers?${queryParams.toString()}`);
            
            setTransfers(Array.isArray(response.data) ? response.data : []);
            setFilters(appliedFilters);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Erreur lors de la récupération des virements';
            setError(errorMessage);
            setTransfers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetFilters = useCallback(async () => {
        await fetchTransfers({});
    }, [fetchTransfers]);

    const applyFilters = useCallback(
        async (newFilters: Filters) => {
            await fetchTransfers(newFilters);
        },
        [fetchTransfers]
    );

    return {
        transfers,
        isLoading,
        error,
        filters,
        fetchTransfers,
        applyFilters,
        resetFilters,
    };
};