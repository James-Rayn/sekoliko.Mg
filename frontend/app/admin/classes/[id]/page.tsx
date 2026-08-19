'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') ?? 'students';

  const [classe, setClasse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchClass();
    fetchStats();
  }, [id]);

  const fetchClass = async () => {
    try {
      const response = await api.get(`/classes/${id}`);
      setClasse(response.data);
    } catch (err) {
      console.error('Erreur chargement classe');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/classes/${id}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur chargement stats');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">🏫</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-400">Classe introuvable</p>
          <Link href="/admin/classes" className="text-blue-600 text-sm mt-2 block">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // Organiser l'emploi du temps par jour
  const scheduleByDay = days.map((day, index) => ({
    day,
    slots: classe.schedules?.filter((s: any) => s.dayOfWeek === index) ?? [],
  })).filter((d) => d.day !== '');

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          ← Retour
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Classe {classe.name}
          </h1>
          <p className="text-gray-400 text-sm">
            {classe.level} • {classe.academicYear}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          classe.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {classe.isActive ? '✅ Active' : '🚫 Inactive'}
        </span>
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500 mt-1">Élèves</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.boys}</p>
            <p className="text-sm text-gray-500 mt-1">Garçons</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-pink-600">{stats.girls}</p>
            <p className="text-sm text-gray-500 mt-1">Filles</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {stats.averageGrade}
            </p>
            <p className="text-sm text-gray-500 mt-1">Moyenne /20</p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'students', label: '👨‍🎓 Élèves' },
            { key: 'schedule', label: '📅 Emploi du temps' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* Onglet Élèves */}
          {activeTab === 'students' && (
            <div>
              {classe.students?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun élève dans cette classe
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classe.students?.map((student: any) => (
                    <Link
                      key={student.id}
                      href={`/admin/students/${student.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {student.matricule}
                        </p>
                      </div>
                      <span className="ml-auto text-lg">
                        {student.gender === 'MALE' ? '👦' : '👧'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Emploi du temps */}
          {activeTab === 'schedule' && (
            <div>
              {classe.schedules?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun créneau planifié
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {scheduleByDay.map(({ day, slots }) => (
                    <div key={day} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-3 text-center uppercase">
                        {day}
                      </p>
                      {slots.length === 0 ? (
                        <p className="text-xs text-gray-300 text-center">—</p>
                      ) : (
                        slots.map((slot: any) => (
                          <div
                            key={slot.id}
                            className="bg-white border border-blue-100 rounded-lg p-2 mb-2 text-xs shadow-sm"
                          >
                            <p className="font-semibold text-blue-800">
                              {slot.subject?.name}
                            </p>
                            <p className="text-gray-500 mt-0.5">
                              👨‍🏫 {slot.teacher?.firstName}{' '}
                              {slot.teacher?.lastName}
                            </p>
                            <p className="text-gray-400 mt-0.5">
                              🕐 {slot.startTime} - {slot.endTime}
                            </p>
                            {slot.room && (
                              <p className="text-gray-400">
                                🚪 Salle {slot.room}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}