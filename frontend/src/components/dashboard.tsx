import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { useTransfers } from '../hooks/useTransfers';
import { useCreateTransfer } from '../hooks/useCreateTransfer';
import api from '../api';
import '../styles/components/card.css';
import '../styles/components/form.css';
import '../styles/components/table.css';
import '../styles/components/button.css';

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
    const { transfers, isLoading: transfersLoading } = useTransfers();
    const { createTransfer, isLoading: transferCreating, error: createError, success: createSuccess, resetMessages } = useCreateTransfer();

    const [currentUser, setCurrentUser] = useState<UserData | null>(user);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        receiver_id: '',
        amount: '',
        description: '',
    });

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

        const success = await createTransfer({
            receiver_id: parseInt(formData.receiver_id),
            amount: parseFloat(formData.amount),
            description: formData.description || undefined,
        });

        if (success) {
            setFormData({ receiver_id: '', amount: '', description: '' });
            setShowTransferForm(false);
            window.location.reload();
        }
    };

    if (!user || !currentUser) {
        return (
            <div style={{
                padding: 'var(--spacing-lg)',
                textAlign: 'center',
            }}>
                Chargement...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: 'var(--spacing-lg)',
            background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-2xl)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-md)',
                }}>
                    <h1 style={{
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-3xl)',
                        margin: 0,
                    }}>
                        Tableau de bord
                    </h1>
                    <button onClick={handleLogout} className="btn-danger">
                        Déconnexion
                    </button>
                </div>

                {/* INFOS UTILISATEUR */}
                <div className="card-glass" style={{
                    marginBottom: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-2xl)',
                }}>
                    <h2 style={{
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-lg)',
                    }}>
                        Informations de compte
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--spacing-lg)',
                    }}>
                        <div>
                            <p style={{
                                color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-sm)',
                                marginBottom: 'var(--spacing-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                Nom complet
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--text-primary)',
                                margin: 0,
                            }}>
                                {currentUser.first_name} {currentUser.last_name}
                            </p>
                        </div>
                        <div>
                            <p style={{
                                color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-sm)',
                                marginBottom: 'var(--spacing-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                Email
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-base)',
                                color: 'var(--text-secondary)',
                                margin: 0,
                            }}>
                                {currentUser.email}
                            </p>
                        </div>
                        <div>
                            <p style={{
                                color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-sm)',
                                marginBottom: 'var(--spacing-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}>
                                Identifiant
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-base)',
                                color: 'var(--text-secondary)',
                                margin: 0,
                            }}>
                                {currentUser.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SOLDE */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary-accent) 0%, rgba(118, 79, 105, 0.8) 100%)',
                    color: 'white',
                    padding: 'var(--spacing-2xl)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-2xl)',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(118, 79, 105, 0.3)',
                }}>
                    <p style={{
                        fontSize: 'var(--font-size-base)',
                        marginBottom: 'var(--spacing-md)',
                        opacity: 0.9,
                    }}>
                        Solde disponible
                    </p>
                    <h2 style={{
                        fontSize: 'var(--font-size-4xl)',
                        margin: 0,
                        fontWeight: 'var(--font-weight-bold)',
                    }}>
                        {currentUser.balance.toFixed(2)} €
                    </h2>
                </div>

                {/* VIREMENT */}
                <div className="card-glass" style={{
                    marginBottom: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-2xl)',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-lg)',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-md)',
                    }}>
                        <h2 style={{
                            color: 'var(--text-primary)',
                            margin: 0,
                        }}>
                            Effectuer un virement
                        </h2>
                        <button
                            onClick={() => {
                                setShowTransferForm(!showTransferForm);
                                resetMessages();
                            }}
                            className="btn-primary"
                        >
                            {showTransferForm ? 'Annuler' : 'Nouveau virement'}
                        </button>
                    </div>

                    {showTransferForm && (
                        <form onSubmit={handleTransferSubmit} className="form-container" style={{
                            marginTop: 'var(--spacing-lg)',
                            paddingTop: 'var(--spacing-lg)',
                            borderTop: '1px solid var(--current-border-color)',
                        }}>
                            {createError && (
                                <div className="card-info error" style={{
                                    marginBottom: 'var(--spacing-lg)',
                                }}>
                                    {createError}
                                </div>
                            )}

                            {createSuccess && (
                                <div className="card-info success" style={{
                                    marginBottom: 'var(--spacing-lg)',
                                }}>
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
                                    style={{
                                        minHeight: '80px',
                                    }}
                                    disabled={transferCreating}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={transferCreating}
                                className="btn-success btn-lg btn-block"
                            >
                                {transferCreating ? 'Envoi en cours...' : 'Envoyer le virement'}
                            </button>
                        </form>
                    )}
                </div>

                {/* HISTORIQUE */}
                <div className="card-glass" style={{
                    padding: 'var(--spacing-2xl)',
                }}>
                    <h2 style={{
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-lg)',
                    }}>
                        Historique des virements
                    </h2>

                    {transfersLoading ? (
                        <p style={{
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl) 0',
                        }}>
                            Chargement des virements...
                        </p>
                    ) : transfers.length === 0 ? (
                        <p style={{
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl) 0',
                        }}>
                            Aucun virement pour le moment
                        </p>
                    ) : (
                        <div style={{
                            overflowX: 'auto',
                        }}>
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
                                            <td style={{
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: transfer.sender_id === currentUser.id ? '#dc3545' : '#28a745',
                                            }}>
                                                {transfer.sender_id === currentUser.id ? '-' : '+'}{transfer.amount.toFixed(2)} €
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
            </div>
        </div>
    );
}