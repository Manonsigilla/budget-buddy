import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();  // Utilise le contexte
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login(email, password);  // Appelle login du contexte (qui stocke le token et met à jour user)
            navigate('/dashboard');  // Redirige après succès
        } catch (error) {
            console.error('Erreur login:', error);
            alert('Erreur de connexion');  // Ajoute un feedback utilisateur
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