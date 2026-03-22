import { useState } from 'react';
import api from '../api';

interface CreateTransferData {
    receiver_id: number;
    amount: number;
    description?: string;
}

export const useCreateTransfer = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createTransfer = async (data: CreateTransferData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!data.receiver_id || !data.amount) {
                setError('Tous les champs requis doivent être remplis');
                return false;
            }

            if (data.amount <= 0) {
                setError('Le montant doit être supérieur à 0');
                return false;
            }

            await api.post('/transfers', data);
            setSuccess(true);
            return true;
        } catch (err: any) {
            if (err.response?.status === 400) {
                setError(err.response?.data?.message || 'Données invalides');
            } else if (err.response?.status === 401) {
                setError('Vous n\'êtes pas authentifié');
            } else if (err.response?.status === 403) {
                setError('Solde insuffisant pour effectuer ce virement');
            } else if (err.response?.status === 404) {
                setError('Destinataire non trouvé');
            } else if (err.response?.status === 500) {
                setError('Erreur serveur. Veuillez réessayer ultérieurement');
            } else {
                setError(err.response?.data?.message || 'Erreur lors de la création du virement');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetMessages = () => {
        setError(null);
        setSuccess(false);
    };

    return { createTransfer, isLoading, error, success, resetMessages };
};