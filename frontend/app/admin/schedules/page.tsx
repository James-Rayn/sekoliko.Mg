'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const HOURS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

const COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
];

// Couleur par matière
const subjectColor = (name: string) => {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
};

// ── Modal création créneau ───────────────────────────────
function ScheduleModal({
  classes,
  subjects,
  teachers,
  onClose,
  onSave,
}: {
  classes: any[];
  subjects: any[];
  teachers: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    room: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/schedules', {
        ...form,
        dayOfWeek: parseInt(String(form.dayOfWeek)),
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            📅 Nouveau créneau
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe *
            </label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.level}
                </option>
              ))}
            </select>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matière *
            </label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner une matière</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Enseignant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant *
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner un enseignant</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Jour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jour *
            </label>
            <select
              value={form.dayOfWeek}
              onChange={(e) =>
                setForm({ ...form, dayOfWeek: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              {DAYS.map((day, index) => (
                <option key={index + 1} value={index + 1}>{day}</option>
              ))}
            </select>
          </div>

          {/* Horaires */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Début *
              </label>
              <select
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fin *
              </label>
              <select
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salle
            </label>
            <input
              type="text"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="Ex: Salle A1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              {loading ? '⏳ Création...' : '✅ Créer le créneau'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────
export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classSchedule, setClassSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      setClasses(classesRes.data.classes);
      setSubjects(subjectsRes.data.subjects);
      setTeachers(teachersRes.data.teachers);
    } catch (err) {
      console.error('Erreur chargement données');
    }
  };

  const fetchClassSchedule = async (classId: string) => {
    if (!classId) {
      setClassSchedule(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/schedules/class/${classId}`);
      setClassSchedule(res.data);
    } catch (err) {
      console.error('Erreur EDT');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/schedules/${id}`);
      fetchClassSchedule(selectedClass);
      setDeleteId(null);
    } catch (err) {
      console.error('Erreur suppression');
    }
  };

  return (
    <div className="space-y-6">

      {/* Modal création */}
      {showModal && (
        <ScheduleModal
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setShowModal(false)}
          onSave={() => fetchClassSchedule(selectedClass)}
        />
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Supprimer ce créneau ?
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Emploi du temps
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Planification des cours par classe
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          ➕ Nouveau créneau
        </button>
      </div>

      {/* Sélection classe + vue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchClassSchedule(e.target.value);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.level}
              </option>
            ))}
          </select>

          {/* Toggle vue */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              📅 Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              📋 Liste
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {!selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sélectionnez une classe
          </h3>
          <p className="text-gray-400 text-sm">
            Choisissez une classe pour voir ou créer son emploi du temps
          </p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl animate-pulse mb-4">📅</div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      ) : (
        <>
          {/* Info classe */}
          {classSchedule && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-2xl">🏫</span>
              <div>
                <p className="font-semibold text-blue-800">
                  {classSchedule.class?.name} — {classSchedule.class?.level}
                </p>
                <p className="text-xs text-blue-600">
                  {classSchedule.totalSlots} créneau(x) planifié(s)
                </p>
              </div>
            </div>
          )}

          {/* Vue Grille */}
          {viewMode === 'grid' && classSchedule && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-gray-500 w-20">
                        Horaire
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-center font-medium text-gray-700"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.filter((_, i) => i < HOURS.length - 1).map((hour) => {
                      const nextHour = HOURS[HOURS.indexOf(hour) + 1];
                      return (
                        <tr
                          key={hour}
                          className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-2 text-xs text-gray-400 font-mono whitespace-nowrap">
                            {hour}
                          </td>
                          {classSchedule.schedule?.map((day: any) => {
                            // Trouver un créneau qui commence à cette heure
                            const slot = day.slots.find(
                              (s: any) => s.startTime === hour,
                            );
                            // Trouver un créneau qui est en cours à cette heure
                            const ongoing = day.slots.find(
                              (s: any) =>
                                s.startTime < hour && s.endTime > hour,
                            );

                            if (slot) {
                              return (
                                <td
                                  key={day.day}
                                  className="px-2 py-1 align-top"
                                >
                                  <div className={`rounded-lg border p-2 text-xs ${subjectColor(slot.subject?.name ?? '')}`}>
                                    <p className="font-semibold">
                                      {slot.subject?.name}
                                    </p>
                                    <p className="opacity-75">
                                      {slot.teacher?.firstName} {slot.teacher?.lastName}
                                    </p>
                                    {slot.room && (
                                      <p className="opacity-60">🚪 {slot.room}</p>
                                    )}
                                    <p className="opacity-60">
                                      {slot.startTime} - {slot.endTime}
                                    </p>
                                    <button
                                      onClick={() => setDeleteId(slot.id)}
                                      className="mt-1 text-xs opacity-50 hover:opacity-100"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              );
                            } else if (ongoing) {
                              return (
                                <td
                                  key={day.day}
                                  className={`px-2 py-1 ${subjectColor(ongoing.subject?.name ?? '')} opacity-20`}
                                />
                              );
                            } else {
                              return (
                                <td
                                  key={day.day}
                                  className="px-2 py-1 text-center"
                                >
                                  <span className="text-gray-200 text-xs">—</span>
                                </td>
                              );
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && classSchedule && (
            <div className="space-y-4">
              {classSchedule.schedule?.map((day: any) => (
                <div
                  key={day.day}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-3 bg-blue-600 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{day.day}</h3>
                    <span className="text-blue-200 text-sm">
                      {day.slots.length} cours
                    </span>
                  </div>
                  {day.slots.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Pas de cours ce jour
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {day.slots.map((slot: any) => (
                        <div
                          key={slot.id}
                          className="px-5 py-3 flex items-center gap-4"
                        >
                          {/* Horaire */}
                          <div className="text-center w-20 flex-shrink-0">
                            <p className="font-mono text-sm font-bold text-blue-600">
                              {slot.startTime}
                            </p>
                            <p className="font-mono text-xs text-gray-400">
                              {slot.endTime}
                            </p>
                          </div>

                          {/* Couleur matière */}
                          <div className={`w-3 h-10 rounded-full flex-shrink-0 ${
                            subjectColor(slot.subject?.name ?? '').split(' ')[0]
                          }`} />

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800">
                              {slot.subject?.name}
                              <span className="ml-2 text-xs font-mono text-gray-400">
                                {slot.subject?.code}
                              </span>
                            </p>
                            <p className="text-sm text-gray-500">
                              👨‍🏫 {slot.teacher?.firstName} {slot.teacher?.lastName}
                              {slot.room && ` • 🚪 ${slot.room}`}
                            </p>
                          </div>

                          {/* Supprimer */}
                          <button
                            onClick={() => setDeleteId(slot.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Aucun créneau */}
          {classSchedule?.totalSlots === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucun créneau planifié
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Cliquez sur "Nouveau créneau" pour commencer
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ➕ Créer le premier créneau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}