'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function TeacherDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await api.get(`/teachers/${id}`);
        setTeacher(response.data);
      } catch (err) {
        console.error('Erreur chargement enseignant');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">👨‍🏫</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-400">Enseignant introuvable</p>
          <Link href="/admin/teachers" className="text-blue-600 text-sm mt-2 block">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-2xl">
            {teacher.firstName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {teacher.firstName} {teacher.lastName}
            </h1>
            <p className="text-gray-400 text-sm">{teacher.user?.email}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          teacher.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {teacher.isActive ? '✅ Actif' : '🚫 Inactif'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Infos personnelles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            👤 Informations personnelles
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Genre</span>
              <span className="text-gray-800">
                {teacher.gender === 'MALE' ? '👨 Homme' : '👩 Femme'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Spécialité</span>
              <span className="text-gray-800">
                {teacher.speciality ?? 'Non renseignée'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone</span>
              <span className="text-gray-800">
                {teacher.phone ?? 'Non renseigné'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Adresse</span>
              <span className="text-gray-800 text-right max-w-32">
                {teacher.address ?? 'Non renseignée'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Embauché le</span>
              <span className="text-gray-800">
                {new Date(teacher.hiredAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Matières enseignées */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📚 Matières enseignées
          </h3>
          {teacher.subjects?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune matière assignée
            </p>
          ) : (
            <div className="space-y-2">
              {teacher.subjects?.map((s: any) => (
                <div
                  key={s.subject.id}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-blue-800">
                    {s.subject.name}
                  </span>
                  <span className="text-xs text-blue-500 font-mono">
                    {s.subject.code}
                  </span>
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
          {teacher.grades?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune note saisie
            </p>
          ) : (
            <div className="space-y-2">
              {teacher.grades?.map((grade: any) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {grade.student?.firstName} {grade.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {grade.subject?.name}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    grade.value >= 10 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {grade.value}/20
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emploi du temps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          📅 Emploi du temps
        </h3>
        {teacher.schedules?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Aucun créneau planifié
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {days.slice(1).map((day, index) => {
              const daySlots = teacher.schedules?.filter(
                (s: any) => s.dayOfWeek === index + 1,
              );
              return (
                <div key={day} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2 text-center">
                    {day}
                  </p>
                  {daySlots?.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center">—</p>
                  ) : (
                    daySlots?.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="bg-blue-100 text-blue-800 rounded p-2 mb-1 text-xs"
                      >
                        <p className="font-medium">{slot.subject?.name}</p>
                        <p className="text-blue-600">{slot.class?.name}</p>
                        <p className="text-blue-400">
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