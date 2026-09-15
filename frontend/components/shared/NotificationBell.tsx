'use client';

import { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

const typeConfig = {
  info: { icon: 'ℹ️', color: 'bg-blue-50 border-blue-100', dot: 'bg-blue-500' },
  success: { icon: '✅', color: 'bg-green-50 border-green-100', dot: 'bg-green-500' },
  warning: { icon: '⚠️', color: 'bg-orange-50 border-orange-100', dot: 'bg-orange-500' },
  error: { icon: '❌', color: 'bg-red-50 border-red-100', dot: 'bg-red-500' },
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">

      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
      >
        <span className="text-xl">🔔</span>

        {/* Badge nombre */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Point de connexion */}
        <span className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
          connected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </button>

      {/* Panneau notifications */}
      {open && (
        <>
          {/* Overlay cliquable */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panneau */}
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

            {/* En-tête */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Tout lire
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Vider
                  </button>
                )}
              </div>
            </div>

            {/* Liste notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-gray-400 text-sm">
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = typeConfig[notif.type] ?? typeConfig.info;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                        !notif.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Icône type */}
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {config.icon}
                      </span>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-800 ${
                          !notif.read ? 'font-semibold' : ''
                        }`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString(
                            'fr-FR',
                            { hour: '2-digit', minute: '2-digit' },
                          )}
                        </p>
                      </div>

                      {/* Indicateur non lu */}
                      <div className="flex-shrink-0 flex items-center gap-1">
                        {!notif.read && (
                          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(notif.id);
                          }}
                          className="text-gray-300 hover:text-gray-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pied de panneau */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className={`text-xs text-center ${
                connected ? 'text-green-600' : 'text-gray-400'
              }`}>
                {connected ? '🟢 Connecté en temps réel' : '⚪ Hors ligne'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}