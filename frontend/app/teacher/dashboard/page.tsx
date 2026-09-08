'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/teacher')
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
          <p className="text-gray-500">
            Profil enseignant introuvable
          </p>
        </div>
      </div>
    );
  }

  const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {data.teacher?.firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.teacher?.speciality ?? 'Enseignant'}
          </p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          📅 {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Mes classes',
            value: data.kpis?.totalClasses,
            icon: '🏫',
            color: 'bg-green-50',
          },
          {
            label: 'Mes élèves',
            value: data.kpis?.totalStudents,
            icon: '👨‍🎓',
            color: 'bg-blue-50',
          },
          {
            label: 'Mes matières',
            value: data.kpis?.totalSubjects,
            icon: '📚',
            color: 'bg-purple-50',
          },
          {
            label: 'Messages non lus',
            value: data.kpis?.unreadMessages,
            icon: '✉️',
            color: 'bg-orange-50',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${kpi.color} rounded-xl flex items-center justify-center text-2xl`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-800">{kpi.value ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Présences + Emploi du temps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Présences aujourd'hui */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📋 Présences aujourd'hui
          </h3>
          {Object.keys(data.attendance?.today ?? {}).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucun appel effectué aujourd'hui
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.attendance?.today ?? {}).map(
                ([status, count]: any) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'present' ? 'bg-green-500'
                        : status === 'absent' ? 'bg-red-500'
                        : status === 'late' ? 'bg-orange-500'
                        : 'bg-blue-500'
                      }`} />
                      <span className="text-sm text-gray-600 capitalize">
                        {status === 'present' ? 'Présents'
                          : status === 'absent' ? 'Absents'
                          : status === 'late' ? 'En retard'
                          : 'Excusés'}
                      </span>
                    </div>
                    <span className="font-bold text-gray-800">{count}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Matières */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📚 Mes matières
          </h3>
          {data.teacher?.subjects?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune matière assignée
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.teacher?.subjects?.map((subject: string, i: number) => (
                <span
                  key={i}
                  className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emploi du temps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          📅 Mon emploi du temps
        </h3>
        {data.schedule?.every((d: any) => d.slots.length === 0) ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Aucun créneau planifié
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {data.schedule?.map((day: any) => (
              <div key={day.day} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2 text-center uppercase">
                  {day.day}
                </p>
                {day.slots.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center">—</p>
                ) : (
                  day.slots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className="bg-green-100 text-green-800 rounded p-2 mb-1 text-xs"
                    >
                      <p className="font-medium">{slot.subject?.name}</p>
                      <p className="text-green-600">{slot.class?.name}</p>
                      <p className="text-green-400">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières notes saisies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          📝 Dernières notes saisies
        </h3>
        {data.recentGrades?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Aucune note saisie récemment
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Élève</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Matière</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Classe</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Note</th>
                </tr>
              </thead>
              <tbody>
                {data.recentGrades?.map((grade: any) => (
                  <tr key={grade.id} className="border-t border-gray-50">
                    <td className="px-4 py-2 text-gray-800">
                      {grade.student?.firstName} {grade.student?.lastName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {grade.subject?.name}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {grade.class?.name}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${
                        grade.value >= 10 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {grade.value}/20
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}