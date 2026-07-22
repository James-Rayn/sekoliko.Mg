'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string | null;
  speciality: string | null;
  isActive: boolean;
  hiredAt: string;
  user: { email: string };
  subjects: { subject: { name: string; code: string } }[];
  schedules: { classId: string }[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers');
      setTeachers(response.data.teachers);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur chargement enseignants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      if (teacher.isActive) {
        await api.patch(`/teachers/${teacher.id}/deactivate`);
      } else {
        await api.patch(`/teachers/${teacher.id}/reactivate`);
      }
      fetchTeachers();
    } catch (err) {
      console.error('Erreur changement statut');
    }
  };

  const filtered = teachers.filter((t) => {
    const matchSearch =
      t.firstName.toLowerCase().includes(search.toLowerCase()) ||
      t.lastName.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email.toLowerCase().includes(search.toLowerCase()) ||
      t.speciality?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des enseignants
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} enseignant(s) au total
          </p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Nouvel enseignant</span>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou spécialité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <button
            onClick={fetchTeachers}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Grille des enseignants */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl animate-pulse mb-2">👨‍🏫</div>
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl mb-2">😕</div>
            <p className="text-gray-400 text-sm">Aucun enseignant trouvé</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              {/* En-tête carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                    {teacher.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {teacher.user?.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  teacher.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {teacher.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Infos */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🎓</span>
                  <span>{teacher.speciality ?? 'Spécialité non renseignée'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📱</span>
                  <span>{teacher.phone ?? 'Téléphone non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🏫</span>
                  <span>
                    {new Set(teacher.schedules?.map((s) => s.classId)).size} classe(s)
                  </span>
                </div>
              </div>

              {/* Matières */}
              {teacher.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {teacher.subjects.map((s) => (
                    <span
                      key={s.subject.code}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {s.subject.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/teachers/${teacher.id}`}
                  className="flex-1 text-center py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  👁️ Voir détail
                </Link>
                <button
                  onClick={() => handleToggleStatus(teacher)}
                  className={`flex-1 py-1.5 text-sm rounded-lg transition ${
                    teacher.isActive
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-green-500 hover:bg-green-50'
                  }`}
                >
                  {teacher.isActive ? '🚫 Désactiver' : '✅ Réactiver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center">
        {filtered.length} enseignant(s) affiché(s) sur {total}
      </p>
    </div>
  );
}