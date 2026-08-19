'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  academicYear: string;
  isActive: boolean;
  _count: { students: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      setClasses(response.data.classes);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur chargement classes');
    } finally {
      setLoading(false);
    }
  };

  // Années scolaires disponibles
  const years = [...new Set(classes.map((c) => c.academicYear))];

  const filtered = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.level.toLowerCase().includes(search.toLowerCase());
    const matchYear = !filterYear || c.academicYear === filterYear;
    return matchSearch && matchYear;
  });

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des classes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} classe(s) au total
          </p>
        </div>
        <Link
          href="/admin/classes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Nouvelle classe</span>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou niveau..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les années</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={fetchClasses}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            🔄 Rafraîchir
          </button>
        </div>
      </div>

      {/* Grille des classes */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl animate-pulse mb-2">🏫</div>
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl mb-2">😕</div>
            <p className="text-gray-400 text-sm">Aucune classe trouvée</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((classe) => {
            const fillRate = Math.round(
              (classe._count.students / classe.capacity) * 100,
            );
            return (
              <div
                key={classe.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                    🏫
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classe.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {classe.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Nom */}
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {classe.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {classe.level} • {classe.academicYear}
                </p>

                {/* Taux de remplissage */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{classe._count.students} élèves</span>
                    <span>Capacité : {classe.capacity}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillRate >= 90
                          ? 'bg-red-500'
                          : fillRate >= 70
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(fillRate, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {fillRate}% remplie
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/classes/${classe.id}`}
                    className="flex-1 text-center py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    👁️ Voir
                  </Link>
                  <Link
                    href={`/admin/classes/${classe.id}?tab=schedule`}
                    className="flex-1 text-center py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
                  >
                    📅 EDT
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {filtered.length} classe(s) affichée(s) sur {total}
      </p>
    </div>
  );
}