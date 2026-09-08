'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/student?academicYear=2024-2025')
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
          <p className="text-gray-500">Profil élève introuvable</p>
        </div>
      </div>
    );
  }

  const getGradeColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 14) return 'text-blue-600';
    if (value >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {data.student?.firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Classe : {data.student?.class ?? 'Non assigné'}
          </p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
          🎓 {data.student?.matricule}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-purple-600">
            {data.kpis?.generalAverage ?? 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Moyenne générale</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-red-500">
            {data.attendance?.absent ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Absences</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-orange-500">
            {data.kpis?.pendingPaymentsCount ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Paiements en attente</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-4xl font-bold text-blue-500">
            {data.kpis?.unreadMessages ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Messages non lus</p>
        </div>
      </div>

      {/* Notes récentes + Paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Dernières notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📝 Dernières notes
          </h3>
          {data.recentGrades?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune note disponible
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentGrades?.map((grade: any) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {grade.subject?.name}
                    </p>
                    <p className="text-xs text-gray-400">{grade.type}</p>
                  </div>
                  <span className={`font-bold text-xl ${getGradeColor(grade.value)}`}>
                    {grade.value}/20
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paiements en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            💰 Paiements en attente
          </h3>
          {data.pendingPayments?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucun paiement en attente 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {data.pendingPayments?.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {payment.feeType?.name}
                    </p>
                    {payment.feeType?.dueDate && (
                      <p className="text-xs text-red-400">
                        Échéance :{' '}
                        {new Date(payment.feeType.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-orange-600">
                    {payment.amount.toLocaleString('fr-FR')} Ar
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="font-bold text-red-600">
                  {data.kpis?.totalPendingAmount?.toLocaleString('fr-FR')} Ar
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emploi du temps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          📅 Mon emploi du temps
        </h3>
        {data.schedule?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Aucun créneau planifié
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {days.slice(1).map((day, index) => {
              const daySlots = data.schedule?.filter(
                (s: any) => s.dayOfWeek === index + 1,
              );
              return (
                <div key={day} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 text-center uppercase">
                    {day}
                  </p>
                  {daySlots?.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center">—</p>
                  ) : (
                    daySlots?.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="bg-purple-100 text-purple-800 rounded p-2 mb-1 text-xs"
                      >
                        <p className="font-medium">{slot.subject?.name}</p>
                        <p className="text-purple-500">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}