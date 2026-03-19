import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransfers } from '../hooks/useTransfers';
import { useCreateTransfer } from '../hooks/useCreateTransfer';
import api from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { transfers, isLoading: transfersLoading, error: transfersError } = useTransfers();
  const { createTransfer, isLoading: transferCreating, error: createError, success: createSuccess, resetMessages } = useCreateTransfer();

  const [currentUser, setCurrentUser] = useState(user);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [formData, setFormData] = useState({
    receiver_id: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    // Récupère les infos actualisées de l'utilisateur
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Erreur récupération utilisateur:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!formData.receiver_id || !formData.amount) {
      return;
    }

    const success = await createTransfer({
      receiver_id: parseInt(formData.receiver_id),
      amount: parseFloat(formData.amount),
      description: formData.description || undefined,
    });

    if (success) {
      setFormData({ receiver_id: '', amount: '', description: '' });
      setShowTransferForm(false);
      window.location.reload();
    }
  };

  if (!user || !currentUser) {
    return <div style={{ padding: '20px' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Tableau de bord</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Déconnexion
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        borderLeft: '4px solid #007bff',
      }}>
        <h2>Informations de compte</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <p style={{ color: '#666', fontSize: '14px' }}>Nom</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentUser.first_name} {currentUser.last_name}</p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '14px' }}>Email</p>
            <p style={{ fontSize: '18px' }}>{currentUser.email}</p>
          </div>
          <div>
            <p style={{ color: '#666', fontSize: '14px' }}>Identifiant</p>
            <p style={{ fontSize: '18px' }}>{currentUser.username}</p>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>Solde disponible</p>
        <h2 style={{ fontSize: '36px', margin: 0 }}>{currentUser.balance.toFixed(2)} EUR</h2>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        borderLeft: '4px solid #007bff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Effectuer un virement</h2>
          <button
            onClick={() => {
              setShowTransferForm(!showTransferForm);
              resetMessages();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showTransferForm ? 'Annuler' : 'Nouveau virement'}
          </button>
        </div>

        {showTransferForm && (
          <form onSubmit={handleTransferSubmit} style={{ marginTop: '20px' }}>
            {createError && (
              <div style={{
                padding: '15px',
                backgroundColor: '#fee',
                borderLeft: '4px solid #f00',
                marginBottom: '20px',
              }}>
                {createError}
              </div>
            )}

            {createSuccess && (
              <div style={{
                padding: '15px',
                backgroundColor: '#d4edda',
                borderLeft: '4px solid #28a745',
                color: '#155724',
                marginBottom: '20px',
              }}>
                Virement créé avec succès !
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                ID du destinataire
              </label>
              <input
                type="number"
                name="receiver_id"
                value={formData.receiver_id}
                onChange={handleFormChange}
                placeholder="Ex: 2"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
                required
                disabled={transferCreating}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Montant (EUR)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleFormChange}
                placeholder="Ex: 100.00"
                step="0.01"
                min="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
                required
                disabled={transferCreating}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Ex: Remboursement"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minHeight: '80px',
                }}
                disabled={transferCreating}
              />
            </div>

            <button
              type="submit"
              disabled={transferCreating}
              style={{
                padding: '10px 20px',
                backgroundColor: transferCreating ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: transferCreating ? 'not-allowed' : 'pointer',
              }}
            >
              {transferCreating ? 'Envoi en cours...' : 'Envoyer le virement'}
            </button>
          </form>
        )}
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        borderLeft: '4px solid #007bff',
      }}>
        <h2>Historique des virements</h2>

        {transfersError && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee',
            borderLeft: '4px solid #f00',
            marginBottom: '20px',
          }}>
            {transfersError}
          </div>
        )}

        {transfersLoading ? (
          <p style={{ color: '#666' }}>Chargement des virements...</p>
        ) : transfers.length === 0 ? (
          <p style={{ color: '#666' }}>Aucun virement pour le moment</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '15px',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#e9ecef' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Montant</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Statut</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{transfer.id}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      color: transfer.sender_id === currentUser.id ? '#dc3545' : '#28a745',
                      fontWeight: 'bold'
                    }}>
                      {transfer.sender_id === currentUser.id ? '-' : '+'}{transfer.amount.toFixed(2)} EUR
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      backgroundColor: transfer.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: transfer.status === 'completed' ? '#155724' : '#856404',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {transfer.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {new Date(transfer.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '10px' }}>{transfer.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}