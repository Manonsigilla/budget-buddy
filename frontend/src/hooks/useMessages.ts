import { useState, useCallback } from 'react';
import api from '../api';

export interface Message {
    id: number;
    sender_id?: number;
    receiver_id?: number;
    sender_name?: string;
    receiver_name?: string;
    sender_email?: string;
    receiver_email?: string;
    subject: string;
    body: string;
    created_at: string;
    read_at: string | null;
    is_read: boolean;
}

export const useMessages = () => {
    const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
    const [sentMessages, setSentMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInbox = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/messages/inbox');
            setInboxMessages(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSent = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/messages/sent');
            setSentMessages(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des messages envoyés');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (receiverId: number, subject: string, body: string) => {
        try {
            setError(null);
            await api.post('/messages', {
                receiver_id: receiverId,
                subject,
                body,
            });
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
            console.error(err);
            return false;
        }
    }, []);

    const markAsRead = useCallback(async (messageId: number) => {
        try {
            await api.put(`/messages/${messageId}/read`);
            setInboxMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
                )
            );
        } catch (err: any) {
            console.error('Erreur marquage message:', err);
        }
    }, []);

    const deleteMessage = useCallback(async (messageId: number) => {
        try {
            await api.delete(`/messages/${messageId}`);
            setInboxMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            setSentMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } catch (err: any) {
            console.error('Erreur suppression message:', err);
        }
    }, []);

    return {
        inboxMessages,
        sentMessages,
        isLoading,
        error,
        fetchInbox,
        fetchSent,
        sendMessage,
        markAsRead,
        deleteMessage,
    };
};