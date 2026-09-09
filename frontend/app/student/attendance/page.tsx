'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student?academicYear=2024-2025')
      .then((res) => {
        const id = res.data.student?.id;
        return api.get(`/attendance/student/${id}`);
      })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">📋</div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PRESENT: { label: 'Présent', color: 'text-green-700', bg: 'bg-green-100' },
    ABSENT: { label: 'Absent', color: 'text-red-700', bg: 'bg-red-100' },
    LATE: { label: 'En retard', color: 'text-orange-700', bg: 'bg-orange-100' },
    EXCUSED: { label: 'Excusé', color: 'text-blue-700', bg: 'bg-blue-100' },
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mes présences</h1>
        <p className="text-gray-500 text-sm mt-1">
          Historique de mes présences et absences
        </p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div
            key={status}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center"
          >
            <p className={`text-3xl font-bold ${config.color}`}>
              {data?.summary?.[status.toLowerCase()] ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Taux d'assiduité */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Taux d'assiduité</h3>
          <span className="text-2xl font-bold text-purple-600">
            {data?.attendanceRate ?? 'N/A'}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all"
            style={{ width: data?.attendanceRate ?? '0%' }}
          />
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Historique ({data?.total ?? 0} entrées)
          </h3>
        </div>
        {data?.attendances?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">Aucune donnée de présence</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.attendances?.map((att: any) => {
              const config = statusConfig[att.status];
              return (
                <div
                  key={att.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(att.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    {att.reason && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {att.reason}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}