import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error: contextError } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        setLocalError('Tous les champs sont requis');
        return;
        }

        if (formData.password.length < 8) {
        setLocalError('Le mot de passe doit contenir au minimum 8 caractères');
        return;
        }

        try {
        await register(formData);
        // Après inscription réussie, rediriger vers login
        navigate('/login', { state: { message: 'Inscription réussie ! Veuillez vous connecter.' } });
        } catch (err: any) {
        setLocalError(err.response?.data?.message || 'Erreur d\'inscription');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h1>Inscription</h1>
            
            {(contextError || localError) && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#fee', 
                    borderLeft: '4px solid #f00',
                    marginBottom: '15px'
                }}>
                    {contextError || localError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nom d'utilisateur :</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        disabled={isLoading}
                    />
                </div>

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
                    <label>Prénom :</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        disabled={isLoading}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Nom :</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        disabled={isLoading}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Mot de passe (min. 8 caractères) :</label>
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
                        backgroundColor: isLoading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? 'Inscription...' : 'S\'inscrire'}
                </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Déjà inscrit ? <a href="/login">Se connecter</a>
            </p>
        </div>
    );
}