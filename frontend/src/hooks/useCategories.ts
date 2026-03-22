import { useState, useEffect } from 'react';
import api from '../api';

export interface Category {
    id: number;
    name: string;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/virements/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Erreur récupération catégories:', err);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryName = (categoryId: number | undefined): string => {
        if (!categoryId) return 'Non catégorisé';
        const category = categories.find((c) => c.id === categoryId);
        return category ? category.name : 'Catégorie inconnue';
    };

    return { categories, isLoading, getCategoryName };
};