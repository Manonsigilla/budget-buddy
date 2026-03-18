import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';  // Utilise api pour cohérence

interface Transfer {
    id: number;
    amount: number;
    // Ajoute d'autres champs si l'API les retourne
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [transfers, setTransfers] = useState<Transfer[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    // Rafraîchir user si besoin (mais backend retourne déjà user au login, donc optionnel)
                    const userRes = await api.get(`/users/${user.id}`);
                    console.log('User data:', userRes.data);  // Pour debug

                    const transfersRes = await api.get('/transfers');  // Utilise api
                    setTransfers(transfersRes.data);
                } catch (error) {
                    console.error('Erreur fetch data:', error);
                    // Ignore si endpoints pas prêts
                }
            }
        };
        fetchData();
    }, [user]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Balance: {user?.balance} €</p>
            <ul>
                {transfers.map(t => <li key={t.id}>Transfer: {t.amount}</li>)}
            </ul>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Dashboard;