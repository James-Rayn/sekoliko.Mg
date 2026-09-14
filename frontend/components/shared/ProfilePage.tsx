'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';

interface ProfilePageProps {
  accentColor: string; // ex: "blue", "green", "purple", "orange"
}

export default function ProfilePage({ accentColor }: ProfilePageProps) {
  const { getUser, logout } = useAuth();
  const user = getUser();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    api.get('/auth/profile')
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message ?? 'Erreur changement de mot de passe',
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      ADMIN: { label: 'Administrateur', color: 'bg-blue-100 text-blue-700' },
      SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
      TEACHER: { label: 'Enseignant', color: 'bg-green-100 text-green-700' },
      STUDENT: { label: 'Élève', color: 'bg-purple-100 text-purple-700' },
      PARENT: { label: 'Parent', color: 'bg-orange-100 text-orange-700' },
      ACCOUNTANT: { label: 'Comptable', color: 'bg-teal-100 text-teal-700' },
    };
    return badges[role] ?? { label: role, color: 'bg-gray-100 text-gray-700' };
  };

  const colorMap: Record<string, string> = {
    blue: 'ring-blue-500 bg-blue-600',
    green: 'ring-green-500 bg-green-600',
    purple: 'ring-purple-500 bg-purple-600',
    orange: 'ring-orange-500 bg-orange-600',
  };

  const tabColor: Record<string, string> = {
    blue: 'border-blue-600 text-blue-600',
    green: 'border-green-600 text-green-600',
    purple: 'border-purple-600 text-purple-600',
    orange: 'border-orange-600 text-orange-600',
  };

  const btnColor: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">👤</div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user?.role ?? '');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* En-tête profil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Bannière */}
        <div className={`h-24 ${btnColor[accentColor]} bg-gradient-to-r`} />

        {/* Avatar + infos */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-full ring-4 ring-white ${colorMap[accentColor].split(' ')[1]} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              🚪 Déconnexion
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-800">
                {profile?.email}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Membre depuis le{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'info', label: '👤 Informations' },
            { key: 'security', label: '🔐 Sécurité' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? `border-b-2 ${tabColor[accentColor]}`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* Informations */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">ID utilisateur</p>
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {profile?.id}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Rôle</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Compte créé le</p>
                  <p className="text-sm text-gray-800">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Infos supplémentaires selon le rôle */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">
                  ℹ️ Informations du compte
                </p>
                <p className="text-xs text-blue-600">
                  Pour modifier vos informations personnelles (nom, téléphone,
                  adresse), contactez votre administrateur.
                </p>
              </div>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  🔑 Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Choisissez un mot de passe fort d'au moins 6 caractères
                </p>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
                    ⚠️ {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">
                    ✅ Mot de passe modifié avec succès !
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      required
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !== passwordForm.confirmPassword
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                    {passwordForm.confirmPassword &&
                      passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className={`w-full py-2.5 ${btnColor[accentColor]} disabled:opacity-50 text-white rounded-lg text-sm font-medium transition`}
                  >
                    {passwordLoading
                      ? '⏳ Modification...'
                      : '🔐 Modifier le mot de passe'}
                  </button>
                </form>
              </div>

              {/* Infos sécurité */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h3 className="font-semibold text-gray-800">
                  🛡️ Conseils de sécurité
                </h3>
                <div className="space-y-2">
                  {[
                    'Utilisez un mot de passe unique pour ce compte',
                    'Ne partagez jamais votre mot de passe',
                    'Déconnectez-vous après chaque session',
                    'Signalez toute activité suspecte à l\'admin',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <p className="text-sm text-gray-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}