'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const menuItems = [
  {
    category: 'Principal',
    items: [
      { label: 'Tableau de bord', icon: '📊', href: '/admin/dashboard' },
      { label: 'Statistiques', icon: '📈', href: '/admin/stats' },
      { label: 'Annonces', icon: '📢', href: '/admin/announcements' },
    ],
  },
  {
    category: 'Gestion',
    items: [
      { label: 'Élèves', icon: '👨‍🎓', href: '/admin/students' },
      { label: 'Enseignants', icon: '👨‍🏫', href: '/admin/teachers' },
      { label: 'Parents', icon: '👨‍👩‍👧', href: '/admin/parents' },
      { label: 'Classes', icon: '🏫', href: '/admin/classes' },
      { label: 'Matières', icon: '📚', href: '/admin/subjects' },
    ],
  },
  {
    category: 'Pédagogie',
    items: [
      { label: 'Notes', icon: '📝', href: '/admin/grades' },
      { label: 'Présences', icon: '✅', href: '/admin/attendance' },
      { label: 'Emploi du temps', icon: '📅', href: '/admin/schedules' },
    ],
  },
  {
    category: 'Finance',
    items: [
      { label: 'Paiements', icon: '💰', href: '/admin/finance' },
      { label: 'Frais scolaires', icon: '🧾', href: '/admin/finance?tab=feeTypes' },
      { label: 'Enregistrer paiement', icon: '💳', href: '/admin/finance/payments/new' },
    ],
  },
  {
    category: 'Communication',
    items: [
      { label: 'Messagerie', icon: '✉️', href: '/admin/messages' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, getUser } = useAuth();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    const path = href.split('?')[0];
    return pathname === path;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col z-50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed ? (
          // Sidebar ouverte
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🏫
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-none">
                  Sekoliko
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">Administration</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
              title="Réduire"
            >
              ◀
            </button>
          </>
        ) : (
          // Sidebar collapsée
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-xl">
              
              <button
              onClick={() => setCollapsed(false)}
              className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800 text-xs"
              title="Agrandir"
            >🏫
            </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {menuItems.map((section) => (
          <div key={section.category} className="mb-4">
            {!collapsed && (
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-1">
                {section.category}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 group ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {active && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profil */}
      <div className="p-3 border-t border-gray-800">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition mb-1"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          )}
        </Link>
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-900/50 hover:text-red-400 transition w-full text-sm ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <span>🚪</span>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}