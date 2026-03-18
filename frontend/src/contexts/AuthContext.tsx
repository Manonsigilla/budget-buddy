import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    balance: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

    useEffect(() => {
        if (token) {
        // Optionnel : valide le token ou charge l'utilisateur depuis l'API
        }
    }, [token]);

    const login = async (email: string, password: string) => {
        const response = await axios.post('http://localhost:5001/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('authToken', token);
        setToken(token);
        setUser(user);
    };

    const register = async (data: any) => {
        await axios.post('http://localhost:5001/auth/register', data);
        // Redirige vers login après inscription
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});