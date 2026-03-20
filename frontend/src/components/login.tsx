import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/components/form.css';
import '../styles/components/card.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
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
                maxWidth: '420px',
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
                        💰 BudgetBuddy
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: 0,
                    }}>
                        Connecte-toi à ton compte
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
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ton.email@exemple.com"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
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
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
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
                        Pas encore de compte ?
                    </p>
                    <Link to="/register" style={{
                        color: 'var(--primary-accent)',
                        fontWeight: 'var(--font-weight-bold)',
                        textDecoration: 'none',
                    }}>
                        S'inscrire ici
                    </Link>
                </div>
            </div>
        </div>
    );
}