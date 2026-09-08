'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { label: 'Tableau de bord', icon: '📊', href: '/parent/dashboard' },
  { label: 'Mes enfants', icon: '👨‍👩‍👧', href: '/parent/children' },
  { label: 'Paiements', icon: '💰', href: '/parent/payments' },
  { label: 'Messagerie', icon: '✉️', href: '/parent/messages' },
];

function ParentSidebar() {
  const pathname = usePathname();
  const { logout, getUser } = useAuth();
  const user = getUser();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-orange-900 to-orange-800 text-white flex flex-col z-50">
      <div className="p-6 border-b border-orange-700">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏫</span>
          <div>
            <h1 className="text-xl font-bold">Sekoliko</h1>
            <p className="text-orange-300 text-xs">Espace parent</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? 'bg-white text-orange-900 font-semibold shadow-md'
                  : 'text-orange-100 hover:bg-orange-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-orange-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-orange-600 rounded-full flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-orange-300 text-xs">Parent</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-orange-200 hover:bg-red-600 hover:text-white transition text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'PARENT') {
      router.push('/login');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-orange-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4 animate-pulse">🏫</div>
          <p className="text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ParentSidebar />
      <main className="ml-64 p-6 min-h-screen">{children}</main>
    </div>
  );
}