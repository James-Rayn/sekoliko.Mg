'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/students/${id}`);
        setStudent(response.data);
      } catch (err) {
        console.error('Erreur chargement élève');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">👨‍🎓</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-400">Élève introuvable</p>
          <Link href="/admin/students" className="text-blue-600 text-sm mt-2 block">
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-gray-400 text-sm font-mono">{student.matricule}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          student.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {student.isActive ? '✅ Actif' : '🚫 Inactif'}
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
              <span className="text-gray-500">Email</span>
              <span className="text-gray-800">{student.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Genre</span>
              <span className="text-gray-800">
                {student.gender === 'MALE' ? '👦 Garçon' : '👧 Fille'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date de naissance</span>
              <span className="text-gray-800">
                {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Classe</span>
              <span className="text-gray-800">
                {student.class?.name ?? 'Non assigné'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone</span>
              <span className="text-gray-800">
                {student.phone ?? 'Non renseigné'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Adresse</span>
              <span className="text-gray-800 text-right max-w-32">
                {student.address ?? 'Non renseignée'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Groupe sanguin</span>
              <span className="text-gray-800">
                {student.bloodType ?? 'Non renseigné'}
              </span>
            </div>
          </div>
        </div>

        {/* Dernières notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📝 Dernières notes
          </h3>
          {student.grades?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune note disponible
            </p>
          ) : (
            <div className="space-y-2">
              {student.grades?.map((grade: any) => (
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
                  <span className={`font-bold text-lg ${
                    grade.value >= 10
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}>
                    {grade.value}/20
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières présences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            📋 Dernières présences
          </h3>
          {student.attendances?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune donnée de présence
            </p>
          ) : (
            <div className="space-y-2">
              {student.attendances?.map((att: any) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">
                    {new Date(att.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    att.status === 'PRESENT'
                      ? 'bg-green-100 text-green-700'
                      : att.status === 'ABSENT'
                      ? 'bg-red-100 text-red-700'
                      : att.status === 'LATE'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {att.status === 'PRESENT' ? 'Présent'
                      : att.status === 'ABSENT' ? 'Absent'
                      : att.status === 'LATE' ? 'En retard'
                      : 'Excusé'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Parents */}
      {student.parents?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            👨‍👩‍👧 Parents / Tuteurs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.parents.map((p: any) => (
              <div
                key={p.parentId}
                className="bg-gray-50 rounded-lg p-4"
              >
                <p className="font-medium text-gray-800">
                  {p.parent.firstName} {p.parent.lastName}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {p.relation} • {p.parent.user?.email}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}