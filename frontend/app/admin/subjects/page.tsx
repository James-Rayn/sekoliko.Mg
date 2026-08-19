'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  description: string | null;
  teachers: { teacher: { firstName: string; lastName: string } }[];
  _count: { grades: number; schedules: number };
}

// ── Modal création/modification ──────────────────────────
function SubjectModal({
  subject,
  onClose,
  onSave,
}: {
  subject?: Subject | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: subject?.name ?? '',
    code: subject?.code ?? '',
    coefficient: subject?.coefficient ?? 1,
    description: subject?.description ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (subject) {
        await api.patch(`/subjects/${subject.id}`, form);
      } else {
        await api.post('/subjects', form);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* En-tête modal */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {subject ? '✏️ Modifier la matière' : '➕ Nouvelle matière'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la matière *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Mathématiques"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="Ex: MATH"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-mono"
            />
          </div>

          {/* Coefficient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coefficient *
            </label>
            <input
              type="number"
              value={form.coefficient}
              onChange={(e) =>
                setForm({ ...form, coefficient: parseFloat(e.target.value) })
              }
              min={0.5}
              max={10}
              step={0.5}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
            >
              {loading ? '⏳ Enregistrement...' : '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────
export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects');
      setSubjects(response.data.subjects);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur chargement matières');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur suppression');
    }
  };

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()),
  );

  // Couleurs par coefficient
  const getCoeffColor = (coeff: number) => {
    if (coeff >= 4) return 'bg-red-100 text-red-700';
    if (coeff >= 3) return 'bg-orange-100 text-orange-700';
    if (coeff >= 2) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">

      {/* Modal création/modification */}
      {showModal && (
        <SubjectModal
          subject={editSubject}
          onClose={() => {
            setShowModal(false);
            setEditSubject(null);
          }}
          onSave={fetchSubjects}
        />
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800">
                Confirmer la suppression
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                Cette action est irréversible. Les notes liées empêcheront
                la suppression.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des matières
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} matière(s) au total
          </p>
        </div>
        <button
          onClick={() => {
            setEditSubject(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Nouvelle matière</span>
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <button
            onClick={fetchSubjects}
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
              <div className="text-4xl animate-pulse mb-2">📚</div>
              <p className="text-gray-400 text-sm">Chargement...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl mb-2">😕</div>
              <p className="text-gray-400 text-sm">Aucune matière trouvée</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Matière
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Coefficient
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Enseignants
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Notes
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Créneaux
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className={`border-b border-gray-50 hover:bg-blue-50 transition ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                          📚
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {subject.name}
                          </p>
                          {subject.description && (
                            <p className="text-xs text-gray-400 truncate max-w-48">
                              {subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {subject.code}
                      </span>
                    </td>

                    {/* Coefficient */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCoeffColor(subject.coefficient)}`}>
                        ×{subject.coefficient}
                      </span>
                    </td>

                    {/* Enseignants */}
                    <td className="px-4 py-3">
                      {subject.teachers?.length === 0 ? (
                        <span className="text-gray-400 text-xs">
                          Non assigné
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {subject.teachers?.slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full"
                            >
                              {t.teacher.firstName} {t.teacher.lastName}
                            </span>
                          ))}
                          {subject.teachers?.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{subject.teachers.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 text-gray-600">
                      <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {subject._count?.grades ?? 0} notes
                      </span>
                    </td>

                    {/* Créneaux */}
                    <td className="px-4 py-3 text-gray-600">
                      <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">
                        {subject._count?.schedules ?? 0} créneaux
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditSubject(subject);
                            setShowModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteId(subject.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
              {filtered.length} matière(s) affichée(s) sur {total}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}