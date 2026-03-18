import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await register({ username, email, password, first_name: firstName, last_name: lastName });  // Passe tous les champs requis
            navigate('/login');  // Redirige vers login après inscription
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            alert('Erreur d\'inscription');  // Feedback
        }
    };

    return (
        <div>
            <h2>Inscription</h2>
            <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />  // Ajouté
            <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />  // Ajouté
            <button onClick={handleRegister}>S'inscrire</button>
        </div>
    );
};

export default Register;