'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

let socket: Socket | null = null;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) return;

    const parsedUser = JSON.parse(user);

    // Connexion au serveur WebSocket
    socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 WebSocket connecté');

      // Enregistrer l'utilisateur
      socket?.emit('register', { userId: parsedUser.id });

      // Rejoindre la room de son rôle
      socket?.emit('join-role', { role: parsedUser.role });
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 WebSocket déconnecté');
    });

    // Écouter les notifications
    socket.on('notification', (notification: Omit<Notification, 'id'>) => {
      const newNotif: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));

      // Son de notification (optionnel)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  // Tout marquer comme lu
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Supprimer une notification
  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Vider tout
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  };
}