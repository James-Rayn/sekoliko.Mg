'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ParentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/parent?academicYear=2024-2025')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">📊</div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data || data.message) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-500">Profil parent introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {data.parent?.firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Vous avez {data.kpis?.totalChildren} enfant(s) inscrit(s)
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-orange-600">
            {data.kpis?.totalChildren}
          </p>
          <p className="text-sm text-gray-500 mt-1">Enfant(s)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-blue-500">
            {data.kpis?.unreadMessages}
          </p>
          <p className="text-sm text-gray-500 mt-1">Messages non lus</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-red-500">
            {data.kpis?.totalPendingAmount?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-sm text-gray-500 mt-1">Total impayés</p>
        </div>
      </div>

      {/* Enfants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          👨‍👩‍👧 Suivi de mes enfants
        </h2>
        {data.children?.map((child: any) => (
          <div
            key={child.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            {/* En-tête enfant */}
            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-xl">
                {child.firstName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-sm text-gray-400">
                  {child.class} • {child.matricule}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {child.generalAverage ?? 'N/A'}
                </p>
                <p className="text-xs text-gray-400">Moyenne /20</p>
              </div>
            </div>

            {/* Stats enfant */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {child.absenceCount}
                </p>
                <p className="text-xs text-gray-500">Absences</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {child.pendingPayments?.length}
                </p>
                <p className="text-xs text-gray-500">Frais en attente</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {child.totalPendingAmount?.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">Montant (Ar)</p>
              </div>
            </div>

            {/* Paiements en attente */}
            {child.pendingPayments?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  💰 Frais en attente :
                </p>
                <div className="space-y-1">
                  {child.pendingPayments?.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm bg-orange-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-gray-700">{p.feeType?.name}</span>
                      <span className="font-medium text-orange-600">
                        {p.amount?.toLocaleString('fr-FR')} Ar
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}