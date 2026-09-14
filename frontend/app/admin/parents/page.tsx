'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  user: { email: string };
  children: {
    relation: string;
    student: {
      firstName: string;
      lastName: string;
      matricule: string;
      class: { name: string } | null;
    };
  }[];
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const res = await api.get(`/parents${params}`);
      setParents(res.data.parents);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erreur chargement parents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParents(search);
  };

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des parents
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} parent(s) enregistré(s)
          </p>
        </div>
        <Link
          href="/admin/parents/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Nouveau parent</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); fetchParents(); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄
          </button>
        </form>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl animate-pulse mb-2">👨‍👩‍👧</div>
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      ) : parents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Aucun parent trouvé
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Commencez par créer un parent
          </p>
          <Link
            href="/admin/parents/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ➕ Nouveau parent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parents.map((parent) => (
            <div
              key={parent.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              {/* En-tête carte */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-xl flex-shrink-0">
                  {parent.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {parent.firstName} {parent.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {parent.user?.email}
                  </p>
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📱</span>
                  <span>{parent.phone ?? 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span className="truncate">{parent.address ?? 'Non renseignée'}</span>
                </div>
              </div>

              {/* Enfants */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Enfants ({parent.children?.length ?? 0})
                </p>
                {parent.children?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Aucun enfant lié
                  </p>
                ) : (
                  <div className="space-y-1">
                    {parent.children?.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-orange-50 rounded-lg px-2 py-1"
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-800">
                            {c.student.firstName} {c.student.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {c.student.class?.name ?? 'Sans classe'} •{' '}
                            {c.student.matricule}
                          </p>
                        </div>
                        <span className="text-xs text-orange-600 font-medium capitalize">
                          {c.relation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/parents/${parent.id}`}
                  className="w-full text-center block py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  👁️ Voir détail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {parents.length} parent(s) affiché(s) sur {total}
      </p>
    </div>
  );
}