import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// Types
interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    balance: number;
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login(data: LoginData): Promise<void>;
    register(data: RegisterData): Promise<void>;
    logout(): void;
    error: string | null;
}

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

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Au montage : charger token depuis localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            } catch (err) {
                // Si parsing échoue, nettoyer
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (data: LoginData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { user: userData, token: authToken } = response.data;
            
            setToken(authToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            
            setUser(userData);
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur de connexion';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        setError(null);
        try {
        const response = await api.post('/auth/register', data);
        // Après registration, faire login auto ou attendre que l'utilisateur se connecte
        // Pour maintenant, on attend que l'utilisateur clique sur login
        setError(null);
        } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur d\'inscription';
        setError(errorMessage);
        throw err;
        } finally {
        setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pour utiliser le contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans AuthProvider');
    }
    return context;
};