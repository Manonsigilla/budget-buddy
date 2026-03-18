import { useState } from 'react';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log('Login réussi:', response.data);
        // Stocke le token (ex: localStorage.setItem('token', response.data.token))
        // Redirige vers le dashboard
        } catch (error) {
            console.error('Erreur login:', error);
        }
    };

    return (
        <div>
            <h2>Connexion</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Se connecter</button>
        </div>
    );
};

export default Login;