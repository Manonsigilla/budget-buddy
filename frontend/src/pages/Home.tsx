import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-lg)',
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
                textAlign: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: 'var(--font-size-4xl)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-md)',
                }}
            >
                💰 Bienvenue sur BudgetBuddy
            </h1>

            <p
                style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--spacing-2xl)',
                    maxWidth: '500px',
                }}
            >
                Gère tes finances simplement et facilement
            </p>

            <div
                style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {isAuthenticated ? (
                    <Link to="/dashboard" className="btn-primary btn-lg">
                        Aller au tableau de bord
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="btn-primary btn-lg">
                            Se connecter
                        </Link>
                        <Link to="/register" className="btn-secondary btn-lg">
                            S'inscrire
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}