import { useState, useEffect } from 'react';
import api from '../api';

interface UserOption {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export const useUsers = () => {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get('/users');
                
                if (!Array.isArray(response.data)) {
                    setError('Format de données invalide reçu du serveur');
                    setUsers([]);
                    return;
                }
                
                setUsers(response.data);
            } catch (err: any) {
                let errorMessage = 'Erreur lors du chargement des utilisateurs';
                
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
                setUsers([]);
                console.error('Erreur fetchUsers:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, isLoading, error };
};