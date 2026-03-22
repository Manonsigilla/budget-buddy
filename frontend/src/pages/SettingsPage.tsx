import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/pages/settings.css';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        if (newTheme !== theme) {
            toggleTheme();
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setDeleteError(null);

            await api.delete('/users/me');
            
            logout();
            navigate('/login');
        } catch (err: any) {
            setDeleteError(err.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Paramètres</h1>

                <div className="settings-grid">
                    <div className="card card-glass settings-card">
                        <div className="settings-header">
                            <h2>
                                <i className="fas fa-sun"></i>
                                Apparence
                            </h2>
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">Mode d'affichage</label>
                            <p className="settings-description">Choisissez votre thème préféré</p>
                            
                            <div className="theme-selector">
                                <button
                                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    <i className="fas fa-sun"></i>
                                    <span>Mode clair</span>
                                </button>
                                <button
                                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    <i className="fas fa-moon"></i>
                                    <span>Mode sombre</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card card-glass settings-card danger">
                        <div className="settings-header">
                            <h2>
                                <i className="fas fa-trash"></i>
                                Zone de danger
                            </h2>
                        </div>

                        <div className="settings-group">
                            <label className="settings-label">Supprimer le compte</label>
                            <p className="settings-description">
                                Cette action est irréversible. Tous vos données seront supprimées.
                            </p>
                            
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <i className="fas fa-exclamation-triangle"></i>
                                Supprimer mon compte
                            </button>
                        </div>
                    </div>
                </div>

                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Supprimer le compte</h2>
                            <p className="modal-warning">
                                Êtes-vous sûr ? Cette action est irréversible.
                            </p>

                            {deleteError && (
                                <div className="card-info error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {deleteError}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                >
                                    <i className="fas fa-times"></i>
                                    Annuler
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    <i className="fas fa-trash"></i>
                                    {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}