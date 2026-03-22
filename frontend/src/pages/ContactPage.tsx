import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { useMessages } from '../hooks/useMessages';
import '../styles/pages/contact.css';

type TabType = 'inbox' | 'sent' | 'compose';

export default function ContactPage() {
    const { user } = useAuth();
    const { users } = useUsers();
    const { inboxMessages, sentMessages, isLoading, error, fetchInbox, fetchSent, sendMessage, markAsRead, deleteMessage } = useMessages();

    const [activeTab, setActiveTab] = useState<TabType>('inbox');
    const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        receiver_id: '',
        subject: '',
        body: '',
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (activeTab === 'inbox') {
            fetchInbox();
        } else if (activeTab === 'sent') {
            fetchSent();
        }
    }, [activeTab, fetchInbox, fetchSent]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!formData.receiver_id || !formData.subject || !formData.body) {
            setFormError('Tous les champs sont requis');
            return;
        }

        try {
            setIsSending(true);
            const success = await sendMessage(parseInt(formData.receiver_id), formData.subject, formData.body);
            
            if (success) {
                setFormSuccess('Message envoyé avec succès');
                setFormData({ receiver_id: '', subject: '', body: '' });
                setTimeout(() => {
                    setFormSuccess(null);
                    setActiveTab('sent');
                    fetchSent();
                }, 2000);
            }
        } finally {
            setIsSending(false);
        }
    };

    const getMessageList = () => {
        if (activeTab === 'inbox') {
            return inboxMessages;
        } else if (activeTab === 'sent') {
            return sentMessages;
        }
        return [];
    };

    const messages = getMessageList();

    return (
        <div className="contact-page">
            <div className="contact-container">
                <h1>Contact et Messages</h1>

                <div className="contact-tabs">
                    <button
                        className={`contact-tab ${activeTab === 'inbox' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('inbox');
                            setSelectedMessage(null);
                        }}
                    >
                        <i className="fas fa-inbox"></i>
                        Reçus ({inboxMessages.length})
                    </button>
                    <button
                        className={`contact-tab ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('sent');
                            setSelectedMessage(null);
                        }}
                    >
                        <i className="fas fa-paper-plane"></i>
                        Envoyés ({sentMessages.length})
                    </button>
                    <button
                        className={`contact-tab ${activeTab === 'compose' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('compose');
                            setSelectedMessage(null);
                        }}
                    >
                        <i className="fas fa-edit"></i>
                        Nouveau message
                    </button>
                </div>

                {error && (
                    <div className="card-info error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {activeTab === 'inbox' && (
                    <div className="messages-list card card-glass">
                        {isLoading ? (
                            <p className="empty-state">
                                <i className="fas fa-spinner fa-spin"></i>
                                Chargement...
                            </p>
                        ) : inboxMessages.length === 0 ? (
                            <p className="empty-state">
                                <i className="fas fa-inbox"></i>
                                Aucun message reçu
                            </p>
                        ) : (
                            <>
                                {selectedMessage === null ? (
                                    <div className="messages-grid">
                                        {inboxMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`message-card ${msg.is_read ? 'read' : 'unread'}`}
                                                onClick={() => setSelectedMessage(msg.id)}
                                            >
                                                <div className="message-header">
                                                    <h3>{msg.sender_name}</h3>
                                                    <span className={`unread-badge ${msg.is_read ? 'hidden' : ''}`}>
                                                        Non lu
                                                    </span>
                                                </div>
                                                <p className="message-subject">{msg.subject}</p>
                                                <p className="message-preview">{msg.body.substring(0, 80)}...</p>
                                                <p className="message-date">
                                                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="message-detail">
                                        {(() => {
                                            const msg = inboxMessages.find((m) => m.id === selectedMessage);
                                            if (!msg) return null;

                                            if (!msg.is_read) {
                                                markAsRead(msg.id);
                                            }

                                            return (
                                                <>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setSelectedMessage(null)}
                                                    >
                                                        <i className="fas fa-arrow-left"></i>
                                                        Retour
                                                    </button>

                                                    <div className="detail-header">
                                                        <div>
                                                            <h2>{msg.subject}</h2>
                                                            <p className="detail-from">De: {msg.sender_name} ({msg.sender_email})</p>
                                                            <p className="detail-date">
                                                                {new Date(msg.created_at).toLocaleString('fr-FR')}
                                                            </p>
                                                        </div>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                deleteMessage(msg.id);
                                                                setSelectedMessage(null);
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                            Supprimer
                                                        </button>
                                                    </div>

                                                    <div className="detail-body">
                                                        {msg.body}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'sent' && (
                    <div className="messages-list card card-glass">
                        {isLoading ? (
                            <p className="empty-state">
                                <i className="fas fa-spinner fa-spin"></i>
                                Chargement...
                            </p>
                        ) : sentMessages.length === 0 ? (
                            <p className="empty-state">
                                <i className="fas fa-paper-plane"></i>
                                Aucun message envoyé
                            </p>
                        ) : (
                            <>
                                {selectedMessage === null ? (
                                    <div className="messages-grid">
                                        {sentMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="message-card sent"
                                                onClick={() => setSelectedMessage(msg.id)}
                                            >
                                                <div className="message-header">
                                                    <h3>Vers: {msg.receiver_name}</h3>
                                                    {msg.is_read && <span className="read-badge">Lu</span>}
                                                </div>
                                                <p className="message-subject">{msg.subject}</p>
                                                <p className="message-preview">{msg.body.substring(0, 80)}...</p>
                                                <p className="message-date">
                                                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="message-detail">
                                        {(() => {
                                            const msg = sentMessages.find((m) => m.id === selectedMessage);
                                            if (!msg) return null;

                                            return (
                                                <>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setSelectedMessage(null)}
                                                    >
                                                        <i className="fas fa-arrow-left"></i>
                                                        Retour
                                                    </button>

                                                    <div className="detail-header">
                                                        <div>
                                                            <h2>{msg.subject}</h2>
                                                            <p className="detail-from">Vers: {msg.receiver_name} ({msg.receiver_email})</p>
                                                            <p className="detail-date">
                                                                {new Date(msg.created_at).toLocaleString('fr-FR')}
                                                            </p>
                                                            {msg.is_read && <p className="detail-read">Lu le {new Date(msg.read_at!).toLocaleString('fr-FR')}</p>}
                                                        </div>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                deleteMessage(msg.id);
                                                                setSelectedMessage(null);
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                            Supprimer
                                                        </button>
                                                    </div>

                                                    <div className="detail-body">
                                                        {msg.body}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'compose' && (
                    <div className="compose-form card card-glass">
                        <h2>Nouveau message</h2>

                        {formError && (
                            <div className="card-info error">
                                <i className="fas fa-exclamation-circle"></i>
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="card-info success">
                                <i className="fas fa-check-circle"></i>
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSendMessage}>
                            <div className="form-group">
                                <label htmlFor="receiver_id">Destinataire</label>
                                <select
                                    id="receiver_id"
                                    name="receiver_id"
                                    value={formData.receiver_id}
                                    onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                                    className="input-neumorphic"
                                    required
                                    disabled={isSending}
                                >
                                    <option value="">Sélectionne un destinataire</option>
                                    {users
                                        .filter((u: any) => u.id !== user?.id)
                                        .map((u: any) => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name} {u.last_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Sujet</label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Sujet du message"
                                    className="input-neumorphic"
                                    required
                                    disabled={isSending}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="body">Message</label>
                                <textarea
                                    id="body"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    placeholder="Écris ton message ici..."
                                    className="input-neumorphic"
                                    rows={10}
                                    required
                                    disabled={isSending}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={isSending}
                            >
                                <i className="fas fa-paper-plane"></i>
                                {isSending ? 'Envoi...' : 'Envoyer le message'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}