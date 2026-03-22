import React, { useState } from 'react';
import '../styles/components/transfer-filter.css';
import '../styles/components/card.css';
import { useCategories } from '../hooks/useCategories';

interface Filters {
    date?: string;
    date_start?: string;
    date_end?: string;
    category_id?: string;
    type?: string;
    sort?: string;
}

interface TransferFilterProps {
    onApplyFilters: (filters: Filters) => Promise<void>;
    onResetFilters: () => Promise<void>;
    isLoading?: boolean;
}

export default function TransferFilter({
    onApplyFilters,
    onResetFilters,
    isLoading = false,
}: TransferFilterProps) {
    const { categories, isLoading: categoriesLoading } = useCategories();
    const [filters, setFilters] = useState<Filters>({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value || undefined,
        }));
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        await onApplyFilters(filters);
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setFilters({});
        await onResetFilters();
    };

    return (
        <div className="card card-glass transfer-filter-container">
            <div className="transfer-filter-header">
                <h3 className="transfer-filter-title">
                    <i className="fas fa-filter"></i>
                    Filtrer les virements
                </h3>
            </div>

            <form onSubmit={handleApply} className="transfer-filter-form">
                {/* ROW 1: Filtres rapides */}
                <div className="filter-row">
                    <div className="form-group">
                        <label htmlFor="type">Type de virement</label>
                        <select
                            id="type"
                            name="type"
                            value={filters.type || ''}
                            onChange={handleChange}
                            className="input-neumorphic"
                            disabled={isLoading}
                        >
                            <option value="">Tous les virements</option>
                            <option value="sent">Virements envoyés</option>
                            <option value="received">Virements reçus</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="sort">Trier par montant</label>
                        <select
                            id="sort"
                            name="sort"
                            value={filters.sort || ''}
                            onChange={handleChange}
                            className="input-neumorphic"
                            disabled={isLoading}
                        >
                            <option value="">Plus récent d'abord</option>
                            <option value="asc">Montant croissant</option>
                            <option value="desc">Montant décroissant</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date exacte</label>
                        <input
                            id="date"
                            type="date"
                            name="date"
                            value={filters.date || ''}
                            onChange={handleChange}
                            className="input-neumorphic"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Toggle pour filtres avancés */}
                <button
                    type="button"
                    className="filter-toggle-btn"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <i className={`fas fa-chevron-${showAdvanced ? 'down' : 'right'}`}></i>
                    Filtres avancés
                </button>

                {/* ROW 2: Filtres avancés */}
                {showAdvanced && (
                    <div className="filter-row filter-row-advanced">
                        <div className="form-group">
                            <label htmlFor="date_start">Date de début</label>
                            <input
                                id="date_start"
                                type="date"
                                name="date_start"
                                value={filters.date_start || ''}
                                onChange={handleChange}
                                className="input-neumorphic"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date_end">Date de fin</label>
                            <input
                                id="date_end"
                                type="date"
                                name="date_end"
                                value={filters.date_end || ''}
                                onChange={handleChange}
                                className="input-neumorphic"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category_id">Catégorie</label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={filters.category_id || ''}
                                onChange={handleChange}
                                className="input-neumorphic"
                                disabled={isLoading || categoriesLoading}
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="filter-actions">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary filter-btn-apply"
                    >
                        <i className="fas fa-search"></i>
                        {isLoading ? 'Filtrage...' : 'Appliquer les filtres'}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="btn btn-secondary filter-btn-reset"
                    >
                        <i className="fas fa-times"></i>
                        Réinitialiser
                    </button>
                </div>
            </form>
        </div>
    );
}