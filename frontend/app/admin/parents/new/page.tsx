'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NewParentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [children, setChildren] = useState<
    { studentId: string; relation: string }[]
  >([]);

  useEffect(() => {
    api.get('/students').then((res) => setStudents(res.data.students));
  }, []);

  const addChild = () => {
    setChildren([...children, { studentId: '', relation: 'père' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (
    index: number,
    field: 'studentId' | 'relation',
    value: string,
  ) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: any = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== ''),
      );

      // Ajouter les enfants valides
      const validChildren = children.filter((c) => c.studentId !== '');
      if (validChildren.length > 0) {
        data.children = validChildren;
      }

      await api.post('/parents', data);
      router.push('/admin/parents');
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

  // Élèves déjà sélectionnés (pour éviter les doublons)
  const selectedStudentIds = children.map((c) => c.studentId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          ← Retour
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Nouveau parent
          </h1>
          <p className="text-gray-400 text-sm">
            Créez un compte parent et liez ses enfants
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              🔐 Compte utilisateur
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="parent@sekoliko.mg"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Identité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              👤 Identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jean"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Rakoto"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="034 00 000 00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Adresse complète"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Enfants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                👨‍👩‍👧 Enfants
              </h3>
              <button
                type="button"
                onClick={addChild}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                ➕ Ajouter un enfant
              </button>
            </div>

            {children.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">👶</div>
                <p className="text-gray-400 text-sm">
                  Cliquez sur "Ajouter un enfant" pour lier des élèves
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Vous pourrez aussi les lier plus tard
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100"
                  >
                    <span className="text-lg flex-shrink-0">👶</span>

                    {/* Sélection élève */}
                    <select
                      value={child.studentId}
                      onChange={(e) =>
                        updateChild(index, 'studentId', e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 bg-white"
                    >
                      <option value="">Sélectionner un élève</option>
                      {students
                        .filter(
                          (s) =>
                            !selectedStudentIds.includes(s.id) ||
                            s.id === child.studentId,
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} —{' '}
                            {s.class?.name ?? 'Sans classe'}
                          </option>
                        ))}
                    </select>

                    {/* Relation */}
                    <select
                      value={child.relation}
                      onChange={(e) =>
                        updateChild(index, 'relation', e.target.value)
                      }
                      className="w-32 px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 bg-white"
                    >
                      <option value="père">Père</option>
                      <option value="mère">Mère</option>
                      <option value="tuteur">Tuteur</option>
                      <option value="tutrice">Tutrice</option>
                      <option value="grand-père">Grand-père</option>
                      <option value="grand-mère">Grand-mère</option>
                      <option value="autre">Autre</option>
                    </select>

                    {/* Supprimer */}
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg transition flex-shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {loading ? '⏳ Enregistrement...' : '✅ Créer le parent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}