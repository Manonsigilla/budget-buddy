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
        await api.post('/transfers', data);
        setSuccess(true);
        return true;
        } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la création du virement';
        setError(errorMessage);
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