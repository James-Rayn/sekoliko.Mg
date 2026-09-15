'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/shared/NotificationBell';

const menuItems = [
  { label: 'Tableau de bord', icon: '📊', href: '/teacher/dashboard' },
  { label: 'Mes classes', icon: '🏫', href: '/teacher/classes' },
  { label: 'Notes', icon: '📝', href: '/teacher/grades' },
  { label: 'Présences', icon: '✅', href: '/teacher/attendance' },
  { label: 'Messagerie', icon: '✉️', href: '/teacher/messages' },
  { label: 'Mon profil', icon: '👤', href: '/teacher/profile' },
];

function TeacherSidebar() {
  const pathname = usePathname();
  const { logout, getUser } = useAuth();
  const user = getUser();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-green-900 to-green-800 text-white flex flex-col z-50">
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏫</span>
          <div>
            <h1 className="text-xl font-bold">Sekoliko</h1>
            <p className="text-green-300 text-xs">Espace enseignant</p>
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
                  ? 'bg-white text-green-900 font-semibold shadow-md'
                  : 'text-green-100 hover:bg-green-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-green-300 text-xs">Enseignant</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-green-200 hover:bg-red-600 hover:text-white transition text-sm"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getUser } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  const user = getUser(); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'TEACHER') {
      router.push('/login');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4 animate-pulse">🏫</div>
          <p className="text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar />

      {/* Navbar */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          Espace Enseignant
        </h2>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-none">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400">Enseignant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="ml-64 mt-16 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}