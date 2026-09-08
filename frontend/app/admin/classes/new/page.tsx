'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/axios';

export default function NewClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    level: '',
    academicYear: '2024-2025',
    capacity: 40,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/classes', form);
      router.push('/admin/classes');
    } catch (err: any) {
      console.error('Erreur:', err.response?.data);
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          ← Retour
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nouvelle classe</h1>
          <p className="text-gray-400 text-sm">
            Créez une nouvelle classe pour l'école
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la classe *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: 6ème A"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau *
            </label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner un niveau</option>
              <option value="6ème">6ème</option>
              <option value="5ème">5ème</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème</option>
              <option value="2nde">2nde</option>
              <option value="1ère">1ère</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>

          {/* Année scolaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année scolaire *
            </label>
            <select
              value={form.academicYear}
              onChange={(e) =>
                setForm({ ...form, academicYear: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          {/* Capacité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité (nombre max d'élèves)
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              min={1}
              max={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
            >
              {loading ? '⏳ Enregistrement...' : '✅ Créer la classe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}