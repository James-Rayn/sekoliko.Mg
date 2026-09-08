'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  class: { id: string; name: string } | null;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [attendance, setAttendance] = useState
    Record<string, { status: string; reason: string }>
  >({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data.classes));
  }, []);

  // Charger les élèves quand on sélectionne une classe
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);

    Promise.all([
      api.get(`/classes/${selectedClass}/students`),
      api.get(`/attendance/class/${selectedClass}?date=${selectedDate}`),
    ])
      .then(([studentsRes, attendanceRes]) => {
        const studentList = studentsRes.data.students;
        setStudents(studentList);

        const existing = attendanceRes.data.attendances ?? [];
        setExistingAttendance(existing);

        // Initialiser l'état des présences
        const initialAttendance: Record
          string,
          { status: string; reason: string }
        > = {};

        studentList.forEach((s: Student) => {
          const found = existing.find((a: any) => a.studentId === s.id);
          initialAttendance[s.id] = {
            status: found?.status ?? 'PRESENT',
            reason: found?.reason ?? '',
          };
        });

        setAttendance(initialAttendance);
      })
      .catch(() => {
        setStudents([]);
        setAttendance({});
      })
      .finally(() => setLoading(false));
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], reason },
    }));
  };

  const handleMarkAll = (status: string) => {
    const updated: Record<string, { status: string; reason: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status, reason: '' };
    });
    setAttendance(updated);
  };

  const handleSave = async () => {
    if (!selectedClass || students.length === 0) return;
    setSaving(true);
    setSuccess(false);

    try {
      await api.post('/attendance/bulk', {
        date: selectedDate,
        classId: selectedClass,
        attendances: students.map((s) => ({
          studentId: s.id,
          status: attendance[s.id]?.status ?? 'PRESENT',
          reason: attendance[s.id]?.reason || undefined,
        })),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  // Compteurs
  const counts = students.reduce(
    (acc, s) => {
      const status = attendance[s.id]?.status ?? 'PRESENT';
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statusConfig: Record
    string,
    { label: string; color: string; bg: string; icon: string }
  > = {
    PRESENT: { label: 'Présent', color: 'text-green-700', bg: 'bg-green-100', icon: '✅' },
    ABSENT: { label: 'Absent', color: 'text-red-700', bg: 'bg-red-100', icon: '❌' },
    LATE: { label: 'En retard', color: 'text-orange-700', bg: 'bg-orange-100', icon: '⏰' },
    EXCUSED: { label: 'Excusé', color: 'text-blue-700', bg: 'bg-blue-100', icon: '📋' },
  };

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Présences et absences
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Faites l'appel par classe
        </p>
      </div>

      {/* Sélection classe + date */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Appel */}
      {selectedClass && (
        <>
          {/* Compteurs */}
          {students.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div
                  key={status}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center"
                >
                  <p className={`text-3xl font-bold ${config.color}`}>
                    {counts[status] ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{config.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Marquer tous comme :
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleMarkAll(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${config.bg} ${config.color} transition hover:opacity-80`}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Liste élèves */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl animate-pulse mb-2">📋</div>
                  <p className="text-gray-400 text-sm">Chargement...</p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl mb-2">😕</div>
                  <p className="text-gray-400 text-sm">
                    Aucun élève dans cette classe
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    {students.length} élève(s) — {selectedDate}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {students.map((student, index) => {
                    const currentStatus =
                      attendance[student.id]?.status ?? 'PRESENT';
                    const config = statusConfig[currentStatus];

                    return (
                      <div
                        key={student.id}
                        className={`p-4 flex items-center gap-4 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        {/* Numéro + Nom */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {student.matricule}
                          </p>
                        </div>

                        {/* Statut actuel */}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color} hidden sm:block`}>
                          {config.icon} {config.label}
                        </span>

                        {/* Boutons statut */}
                        <div className="flex gap-1">
                          {Object.entries(statusConfig).map(
                            ([status, conf]) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusChange(student.id, status)
                                }
                                title={conf.label}
                                className={`w-8 h-8 rounded-lg text-sm transition ${
                                  currentStatus === status
                                    ? `${conf.bg} ${conf.color} shadow-sm`
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {conf.icon}
                              </button>
                            ),
                          )}
                        </div>

                        {/* Raison si absent/retard */}
                        {(currentStatus === 'ABSENT' ||
                          currentStatus === 'LATE') && (
                          <input
                            type="text"
                            placeholder="Raison..."
                            value={attendance[student.id]?.reason ?? ''}
                            onChange={(e) =>
                              handleReasonChange(student.id, e.target.value)
                            }
                            className="w-32 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bouton sauvegarder */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  {success && (
                    <span className="text-green-600 text-sm font-medium">
                      ✅ Appel enregistré avec succès !
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      '💾 Enregistrer l\'appel'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Message si pas de classe sélectionnée */}
      {!selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sélectionnez une classe
          </h3>
          <p className="text-gray-400 text-sm">
            Choisissez une classe et une date pour faire l'appel
          </p>
        </div>
      )}
    </div>
  );
}