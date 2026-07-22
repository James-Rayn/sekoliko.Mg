'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: string;
  isActive: boolean;
  enrolledAt: string;
  user: { email: string };
  class: { name: string; level: string } | null;
}

// ── Composant badge statut ───────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
    }`}>
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data.students);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur chargement élèves');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage côté client
  const filtered = students.filter((s) => {
    const matchSearch =
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email.toLowerCase().includes(search.toLowerCase());

    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && s.isActive) ||
      (filterActive === 'inactive' && !s.isActive);

    return matchSearch && matchActive;
  });

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des élèves
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} élève(s) au total
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Nouvel élève</span>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Recherche */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="all">Tous les élèves</option>
            <option value="active">Actifs seulement</option>
            <option value="inactive">Inactifs seulement</option>
          </select>

          {/* Bouton rafraîchir */}
          <button
            onClick={fetchStudents}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl animate-pulse mb-2">👨‍🎓</div>
              <p className="text-gray-400 text-sm">Chargement...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl mb-2">😕</div>
              <p className="text-gray-400 text-sm">Aucun élève trouvé</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Élève
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Matricule
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Classe
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Genre
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Inscription
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`border-b border-gray-50 hover:bg-blue-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                          {student.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {student.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Matricule */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {student.matricule}
                      </span>
                    </td>

                    {/* Classe */}
                    <td className="px-4 py-3 text-gray-600">
                      {student.class ? (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          {student.class.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Sans classe
                        </span>
                      )}
                    </td>

                    {/* Genre */}
                    <td className="px-4 py-3 text-gray-600">
                      {student.gender === 'MALE' ? '👦 Garçon' : '👧 Fille'}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <StatusBadge isActive={student.isActive} />
                    </td>

                    {/* Date inscription */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(student.enrolledAt).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Voir le détail"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1.5 rounded-lg transition ${
                            student.isActive
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={student.isActive ? 'Désactiver' : 'Réactiver'}
                        >
                          {student.isActive ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer tableau */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
              {filtered.length} élève(s) affiché(s) sur {total}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  async function handleToggleStatus(student: Student) {
    try {
      if (student.isActive) {
        await api.patch(`/students/${student.id}/deactivate`);
      } else {
        await api.patch(`/students/${student.id}/reactivate`);
      }
      fetchStudents();
    } catch (err) {
      console.error('Erreur changement statut');
    }
  }
}