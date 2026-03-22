import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import '../styles/pages/profile.css';

interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    balance: number;
}

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users/me');
            setUserData(response.data);
            setFormData({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
                username: response.data.username,
            });
        } catch (err: any) {
            setError('Erreur lors du chargement du profil');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(null);

            await api.put('/users/me', formData);
            setSuccess('Profil mis à jour avec succès');
            setIsEditing(false);
            fetchUserData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return <div className="profile-loading">Chargement du profil...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>Mon Profil</h1>

                {error && (
                    <div className="card-info error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="card-info success">
                        <i className="fas fa-check-circle"></i>
                        {success}
                    </div>
                )}

                <div className="card card-glass profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {userData.first_name.charAt(0).toUpperCase()}
                            {userData.last_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <h2>{userData.first_name} {userData.last_name}</h2>
                            <p className="profile-username">@{userData.username}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <>
                            <div className="profile-details">
                                <div className="detail-item">
                                    <label>Email</label>
                                    <p>{userData.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Solde</label>
                                    <p className="balance">{userData.balance.toFixed(2)} €</p>
                                </div>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit"></i>
                                Modifier le profil
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="first_name">Prénom</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="input-neumorphic"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">Nom</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="input-neumorphic"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-neumorphic"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">Nom d'utilisateur</label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="input-neumorphic"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="profile-actions">
                                <button 
                                    className="btn btn-success"
                                    onClick={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-check"></i>
                                    Enregistrer
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            first_name: userData.first_name,
                                            last_name: userData.last_name,
                                            email: userData.email,
                                            username: userData.username,
                                        });
                                    }}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-times"></i>
                                    Annuler
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}