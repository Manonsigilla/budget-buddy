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
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, isLoading, error };
};