import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Validation simple
        if (!formData.email || !formData.password) {
        setLocalError('Tous les champs sont requis');
        return;
        }

        try {
        await login(formData);
        navigate('/dashboard');
        } catch (err: any) {
        setLocalError(err.response?.data?.message || 'Erreur de connexion');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h1>Connexion</h1>
        
            {(error || localError) && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#fee', 
                    borderLeft: '4px solid #f00',
                    marginBottom: '15px'
                }}>
                    {error || localError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email :</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        disabled={isLoading}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Mot de passe :</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Pas encore inscrit ? <a href="/register">S'inscrire</a>
            </p>
        </div>
    );
}