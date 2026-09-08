'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    address: '',
    classId: '',
    bloodType: '',
    medicalNotes: '',
  });

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data.classes));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Nettoyer les champs vides
      const data = Object.fromEntries(
        Object.entries(form).filter(([_, v]) => v !== ''),
      );
      await api.post('/students', data);
      router.push('/admin/students');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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
            Nouvel élève
          </h1>
          <p className="text-gray-400 text-sm">
            Remplissez les informations de l'élève
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

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Section compte */}
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
                  placeholder="eleve@sekoliko.mg"
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
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section identité */}
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
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  placeholder="Rakoto"
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
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder="Andry"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre *
                </label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="MALE">👦 Garçon</option>
                  <option value="FEMALE">👧 Fille</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section scolarité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              🏫 Scolarité
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <select
                value={form.classId}
                onChange={(e) =>
                  setForm({ ...form, classId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">Sans classe pour l'instant</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              📱 Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="034 00 000 00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groupe sanguin
                </label>
                <select
                  value={form.bloodType}
                  onChange={(e) =>
                    setForm({ ...form, bloodType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Non renseigné</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                    (b) => (
                      <option key={b} value={b}>{b}</option>
                    ),
                  )}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Adresse complète"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Notes médicales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              🏥 Informations médicales
            </h3>
            <textarea
              value={form.medicalNotes}
              onChange={(e) =>
                setForm({ ...form, medicalNotes: e.target.value })
              }
              placeholder="Allergies, traitements, remarques médicales..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
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
              {loading ? '⏳ Enregistrement...' : '✅ Créer l\'élève'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}