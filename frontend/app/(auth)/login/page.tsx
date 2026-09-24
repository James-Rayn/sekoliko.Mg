'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex">

      {/* Côté gauche — Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex-col items-center justify-center p-12 relative overflow-hidden">

        {/* Cercles décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6 animate-bounce">🏫</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sekoliko MG
          </h1>
          <p className="text-blue-200 text-lg max-w-sm leading-relaxed">
            La plateforme numérique complète pour la gestion de votre établissement scolaire
          </p>

          {/* Features */}
          <div className="mt-10 space-y-3 text-left">
            {[
              { icon: '📊', text: 'Tableaux de bord en temps réel' },
              { icon: '📝', text: 'Gestion des notes et bulletins' },
              { icon: '👨‍👩‍👧', text: 'Communication parents-école' },
              { icon: '💰', text: 'Suivi des paiements scolaires' },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-3 text-blue-100"
              >
                <span className="text-xl w-8 text-center">{feature.icon}</span>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Côté droit — Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🏫</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">
              Sekoliko MG
            </h1>
          </div>

          {/* Card formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Bon retour ! 👋
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Connectez-vous à votre espace personnel
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-medium text-sm">Erreur de connexion</p>
                  <p className="text-xs mt-0.5 opacity-80">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ✉️
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    🔒
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input pl-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Aide */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Problème de connexion ? Contactez votre administrateur
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 Sekoliko MG — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}