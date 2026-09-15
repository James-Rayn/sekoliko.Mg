'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function Toast() {
  const { notifications } = useNotifications();
  const [visible, setVisible] = useState<any[]>([]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    if (latest.read) return;

    // Afficher le toast
    setVisible((prev) => [latest, ...prev].slice(0, 3));

    // Auto-disparition après 4 secondes
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((n) => n.id !== latest.id));
    }, 4000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const typeConfig: Record<string, { color: string; icon: string }> = {
    info: { color: 'bg-blue-600', icon: 'ℹ️' },
    success: { color: 'bg-green-600', icon: '✅' },
    warning: { color: 'bg-orange-500', icon: '⚠️' },
    error: { color: 'bg-red-600', icon: '❌' },
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {visible.map((toast) => {
        const config = typeConfig[toast.type] ?? typeConfig.info;
        return (
          <div
            key={toast.id}
            className={`${config.color} text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 min-w-72 max-w-sm animate-slide-in`}
          >
            <span className="text-lg flex-shrink-0">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-xs opacity-90 mt-0.5 truncate">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() =>
                setVisible((prev) => prev.filter((n) => n.id !== toast.id))
              }
              className="text-white/70 hover:text-white text-sm flex-shrink-0"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}