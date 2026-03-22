import { useState, useEffect } from 'react';
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
}

export const useTransfers = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransfers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/transfers');
            setTransfers(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des virements';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
        };

        fetchTransfers();
    }, []);

    return { transfers, isLoading, error };
};