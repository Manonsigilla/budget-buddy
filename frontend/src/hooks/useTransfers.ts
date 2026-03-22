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
                setError(null);
                const response = await api.get('/transfers');
                
                if (!Array.isArray(response.data)) {
                    setError('Format de données invalide reçu du serveur');
                    setTransfers([]);
                    return;
                }
                
                setTransfers(response.data);
            } catch (err: any) {
                let errorMessage = 'Erreur lors de la récupération des virements';
                
                if (err.response?.status === 401) {
                    errorMessage = 'Vous n\'êtes pas authentifié';
                } else if (err.response?.status === 403) {
                    errorMessage = 'Vous n\'avez pas accès à ces données';
                } else if (err.response?.status === 500) {
                    errorMessage = 'Erreur serveur. Veuillez réessayer ultérieurement';
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message === 'Network Error') {
                    errorMessage = 'Impossible de se connecter au serveur';
                }
                
                setError(errorMessage);
                setTransfers([]);
                console.error('Erreur fetchTransfers:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransfers();
    }, []);

    return { transfers, isLoading, error };
};