import { useState, useEffect, useCallback } from 'react';

export interface Notification {
    id: string;
    type: 'warning' | 'danger' | 'info' | 'success';
    message: string;
    autoClose?: number;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
            ...notification,
            id,
            autoClose: notification.autoClose ?? 5000,
        };

        setNotifications((prev) => [...prev, newNotification]);

        if (newNotification.autoClose) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.autoClose);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, []);

    return { notifications, addNotification, removeNotification };
};