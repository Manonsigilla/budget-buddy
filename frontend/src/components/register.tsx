import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/components/form.css';
import '../styles/components/card.css';

interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export default function Register() {
    const [formData, setFormData] = useState<RegisterData>({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)',
            background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        }}>
            <div className="card-glass" style={{
                width: '100%',
                maxWidth: '500px',
                padding: 'var(--spacing-2xl)',
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-2xl)',
                }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-3xl)',
                        marginBottom: 'var(--spacing-sm)',
                        color: 'var(--text-primary)',
                    }}>
                        Créer un compte
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: 0,
                    }}>
                        Rejoins BudgetBuddy dès maintenant
                    </p>
                </div>

                {error && (
                    <div className="card-info error" style={{
                        marginBottom: 'var(--spacing-lg)',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">Prénom</label>
                            <input
                                id="first_name"
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Jean"
                                required
                                disabled={isLoading}
                                className="input-neumorphic"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Nom</label>
                            <input
                                id="last_name"
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Dupont"
                                required
                                disabled={isLoading}
                                className="input-neumorphic"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ton.email@exemple.com"
                            required
                            disabled={isLoading}
                            className="input-neumorphic"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="jeandup123"
                            required
                            disabled={isLoading}
                            className="input-neumorphic"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 caractères"
                            required
                            disabled={isLoading}
                            className="input-neumorphic"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirme ton mot de passe"
                            required
                            disabled={isLoading}
                            className="input-neumorphic"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary btn-lg btn-block"
                        style={{
                            marginTop: 'var(--spacing-lg)',
                        }}
                    >
                        {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--spacing-lg)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--current-border-color)',
                }}>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-sm)',
                    }}>
                        Déjà inscrit ?
                    </p>
                    <Link to="/login" style={{
                        color: 'var(--primary-accent)',
                        fontWeight: 'var(--font-weight-bold)',
                        textDecoration: 'none',
                    }}>
                        Se connecter ici
                    </Link>
                </div>
            </div>
        </div>
    );
}