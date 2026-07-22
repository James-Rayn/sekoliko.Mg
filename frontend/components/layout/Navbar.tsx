'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/students': 'Gestion des élèves',
  '/admin/teachers': 'Gestion des enseignants',
  '/admin/classes': 'Gestion des classes',
  '/admin/subjects': 'Gestion des matières',
  '/admin/grades': 'Notes et évaluations',
  '/admin/attendance': 'Présences et absences',
  '/admin/finance': 'Gestion financière',
  '/admin/messages': 'Messagerie',
  '/admin/announcements': 'Annonces',
  '/admin/schedules': 'Emploi du temps',
  '/admin/fee-types': 'Types de frais',
};

export default function Navbar() {
  const pathname = usePathname();
  const { getUser } = useAuth();
  const user = getUser();
  const title = pageTitles[pathname] ?? 'Sekoliko';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 shadow-sm">

      {/* Titre de la page */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Messages */}
        <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <span className="text-xl">✉️</span>
        </button>

        {/* Profil */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 leading-none">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}