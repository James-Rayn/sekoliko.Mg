'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    category: 'Principal',
    items: [
      { label: 'Tableau de bord', icon: '📊', href: '/admin/dashboard' },
      { label: 'Annonces', icon: '📢', href: '/admin/announcements' },
    ],
  },
  {
    category: 'Gestion',
    items: [
      { label: 'Élèves', icon: '👨‍🎓', href: '/admin/students' },
      { label: 'Enseignants', icon: '👨‍🏫', href: '/admin/teachers' },
      { label: 'Classes', icon: '🏫', href: '/admin/classes' },
      { label: 'Matières', icon: '📚', href: '/admin/subjects' },
      { label: 'Parents', icon: '👨‍👩‍👧', href: '/admin/parents' },      
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
      { label: 'Frais scolaires', icon: '🧾', href: '/admin/fee-types' },
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col z-50">

      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏫</span>
          <div>
            <h1 className="text-xl font-bold">Sekoliko</h1>
            <p className="text-blue-300 text-xs">Gestion scolaire</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((section) => (
          <div key={section.category} className="mb-6">
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              {section.category}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-900 font-semibold shadow-md'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profil + Déconnexion */}
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-blue-300 text-xs">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:bg-red-600 hover:text-white transition-all duration-200 text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}