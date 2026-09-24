'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NotificationBell from '@/components/shared/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Tableau de bord', subtitle: 'Vue générale de l\'établissement' },
  '/admin/students': { title: 'Élèves', subtitle: 'Gestion des dossiers élèves' },
  '/admin/teachers': { title: 'Enseignants', subtitle: 'Gestion du personnel enseignant' },
  '/admin/parents': { title: 'Parents', subtitle: 'Gestion des parents et tuteurs' },
  '/admin/classes': { title: 'Classes', subtitle: 'Gestion des classes' },
  '/admin/subjects': { title: 'Matières', subtitle: 'Gestion des matières enseignées' },
  '/admin/grades': { title: 'Notes', subtitle: 'Saisie et consultation des notes' },
  '/admin/attendance': { title: 'Présences', subtitle: 'Suivi des absences et présences' },
  '/admin/schedules': { title: 'Emploi du temps', subtitle: 'Planification des cours' },
  '/admin/finance': { title: 'Finance', subtitle: 'Gestion financière' },
  '/admin/messages': { title: 'Messagerie', subtitle: 'Communication interne' },
  '/admin/stats': { title: 'Statistiques', subtitle: 'Analyses et rapports' },
  '/admin/profile': { title: 'Mon profil', subtitle: 'Paramètres du compte' },
};

export default function Navbar() {
  const pathname = usePathname();
  const { getUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const pageInfo = pageTitles[pathname] ?? {
    title: 'Sekoliko',
    subtitle: 'Plateforme de gestion scolaire',
  };

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40">

      {/* Titre page */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-none">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">

        {/* Date */}
        <div className="hidden md:block text-xs text-gray-400 mr-2">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Profil */}
        <Link
          href="/admin/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-800 leading-none truncate max-w-32">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}