import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { useFilteredTransfers } from '../hooks/useFilteredTransfers';
import { useCreateTransfer } from '../hooks/useCreateTransfer';
import api from '../api';
import '../styles/components/card.css';
import '../styles/components/form.css';
import '../styles/components/table.css';
import '../styles/components/button.css';
import '../styles/components/dashboard.css';
import Analytics from './Analytics';
import TransferFilter from './TransferFilter';

interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    balance: number;
}

interface FormData {
    receiver_id: string;
    amount: string;
    description: string;
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { users } = useUsers();
    const { transfers, isLoading: transfersLoading, applyFilters, resetFilters } = useFilteredTransfers();
    const { createTransfer, isLoading: transferCreating, error: createError, success: createSuccess, resetMessages } = useCreateTransfer();

    const [currentUser, setCurrentUser] = useState<UserData | null>(user);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        receiver_id: '',
        amount: '',
        description: '',
    });
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        resetFilters();
    }, [resetFilters]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setCurrentUser(response.data);
            } catch (err) {
                console.error('Erreur récupération utilisateur:', err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        resetMessages();

        if (!formData.receiver_id || !formData.amount) {
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        const success = await createTransfer({
            receiver_id: parseInt(formData.receiver_id),
            amount: amount,
            description: formData.description || undefined,
        });

        if (success) {
            setFormData({ receiver_id: '', amount: '', description: '' });
            setShowTransferForm(false);
            resetFilters();
        }
    };

    if (!user || !currentUser) {
        return <div className="loading-container">Chargement...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* HEADER */}
                <div className="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <button onClick={handleLogout} className="btn btn-danger">
                        <i className="fas fa-sign-out-alt"></i>
                        Déconnexion
                    </button>
                </div>

                {/* INFOS UTILISATEUR */}
                <div className="card card-glass dashboard-user-info">
                    <h2>Informations de compte</h2>
                    <div className="user-info-grid">
                        <div className="info-item">
                            <p className="info-label">Nom complet</p>
                            <p className="info-value">
                                {currentUser.first_name} {currentUser.last_name}
                            </p>
                        </div>
                        <div className="info-item">
                            <p className="info-label">Email</p>
                            <p className="info-value">{currentUser.email}</p>
                        </div>
                        <div className="info-item">
                            <p className="info-label">Identifiant</p>
                            <p className="info-value">{currentUser.username}</p>
                        </div>
                    </div>
                </div>

                {/* SOLDE */}
                <div className="dashboard-balance">
                    <p className="balance-label">Solde disponible</p>
                    <h2 className="balance-value">
                        {currentUser.balance.toFixed(2)} €
                    </h2>
                </div>

                {/* VIREMENT */}
                <div className="card card-glass dashboard-transfer">
                    <div className="transfer-header">
                        <h2>Effectuer un virement</h2>
                        <button
                            onClick={() => {
                                setShowTransferForm(!showTransferForm);
                                resetMessages();
                            }}
                            className="btn btn-primary"
                        >
                            <i className={`fas fa-${showTransferForm ? 'times' : 'plus'}`}></i>
                            {showTransferForm ? 'Annuler' : 'Nouveau virement'}
                        </button>
                    </div>

                    {showTransferForm && (
                        <form onSubmit={handleTransferSubmit} className="form-container transfer-form">
                            {createError && (
                                <div className="card-info error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {createError}
                                </div>
                            )}

                            {createSuccess && (
                                <div className="card-info success">
                                    <i className="fas fa-check-circle"></i>
                                    Virement créé avec succès !
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="receiver_id">Destinataire</label>
                                <select
                                    id="receiver_id"
                                    name="receiver_id"
                                    value={formData.receiver_id}
                                    onChange={handleFormChange}
                                    className="input-neumorphic"
                                    required
                                    disabled={transferCreating}
                                >
                                    <option value="">Sélectionne un destinataire</option>
                                    {users
                                        .filter((u: any) => u.id !== currentUser.id)
                                        .map((u: any) => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name} {u.last_name} ({u.username}) - {u.email}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Montant (€)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    placeholder="Ex: 100.00"
                                    step="0.01"
                                    min="0.01"
                                    className="input-neumorphic"
                                    required
                                    disabled={transferCreating}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description (optionnel)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Ex: Remboursement"
                                    className="input-neumorphic"
                                    disabled={transferCreating}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={transferCreating}
                                className="btn btn-success btn-lg btn-block"
                            >
                                <i className="fas fa-paper-plane"></i>
                                {transferCreating ? 'Envoi en cours...' : 'Envoyer le virement'}
                            </button>
                        </form>
                    )}
                </div>

                {/* FILTRES */}
                <TransferFilter
                    onApplyFilters={applyFilters}
                    onResetFilters={resetFilters}
                    isLoading={transfersLoading}
                />

                {/* HISTORIQUE */}
                <div className="card card-glass dashboard-history">
                    <div className="dashboard-history-header">
                        <h2>Historique des virements</h2>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setShowAnalytics(true)}
                            title="Afficher les graphiques"
                        >
                            <i className="fas fa-chart-bar"></i>
                        </button>
                    </div>

                    {transfersLoading ? (
                        <p className="empty-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            Chargement des virements...
                        </p>
                    ) : transfers.length === 0 ? (
                        <p className="empty-state">
                            <i className="fas fa-inbox"></i>
                            Aucun virement pour le moment
                        </p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((transfer: any, index: number) => (
                                        <tr key={index}>
                                            <td>#{transfer.id}</td>
                                            <td className={`amount ${transfer.sender_id === currentUser.id ? 'sent' : 'received'}`}>
                                                {transfer.sender_id === currentUser.id ? '-' : '+'}
                                                {transfer.amount.toFixed(2)} €
                                            </td>
                                            <td>
                                                <span className={`status-badge ${transfer.status}`}>
                                                    {transfer.status}
                                                </span>
                                            </td>
                                            <td>{new Date(transfer.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td>{transfer.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL ANALYTICS */}
                {showAnalytics && (
                    <Analytics
                        transfers={transfers}
                        currentUserId={currentUser.id}
                        onClose={() => setShowAnalytics(false)}
                    />
                )}
            </div>
        </div>
    );
}