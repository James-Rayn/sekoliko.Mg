'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  class: { id: string; name: string } | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  value: number;
  type: string;
  period: number;
  academicYear: string;
  comment: string | null;
  gradedAt: string;
  student: { firstName: string; lastName: string; matricule: string };
  subject: { name: string; code: string };
  teacher: { firstName: string; lastName: string };
}

// ── Modal saisie de note ─────────────────────────────────
function GradeModal({
  students,
  subjects,
  classes,
  onClose,
  onSave,
}: {
  students: Student[];
  subjects: Subject[];
  classes: Class[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    value: '',
    type: 'devoir',
    period: 1,
    academicYear: '2024-2025',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrer les élèves par classe
  const filteredStudents = form.classId
    ? students.filter((s) => s.class?.id === form.classId)
    : students;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/grades', {
        ...form,
        value: parseFloat(form.value),
        period: parseInt(String(form.period)),
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            📝 Saisir une note
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            ✕
          </button>
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
              onChange={(e) =>
                setForm({ ...form, classId: e.target.value, studentId: '' })
              }
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Élève */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Élève *
            </label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Sélectionner un élève</option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.matricule})
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

          {/* Note + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note /20 *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                min={0}
                max={20}
                step={0.25}
                required
                placeholder="Ex: 15.5"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="devoir">Devoir</option>
                <option value="examen">Examen</option>
                <option value="contrôle">Contrôle</option>
                <option value="participation">Participation</option>
              </select>
            </div>
          </div>

          {/* Période + Année */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période *
              </label>
              <select
                value={form.period}
                onChange={(e) =>
                  setForm({ ...form, period: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value={1}>Trimestre 1</option>
                <option value={2}>Trimestre 2</option>
                <option value={3}>Trimestre 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année scolaire *
              </label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) =>
                  setForm({ ...form, academicYear: e.target.value })
                }
                placeholder="2024-2025"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appréciation
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Appréciation optionnelle..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              {loading ? '⏳ Enregistrement...' : '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────
export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [gradesRes, studentsRes, subjectsRes, classesRes] =
        await Promise.all([
          api.get('/grades/student/all').catch(() => ({ data: { grades: [] } })),
          api.get('/students'),
          api.get('/subjects'),
          api.get('/classes'),
        ]);

      setStudents(studentsRes.data.students);
      setSubjects(subjectsRes.data.subjects);
      setClasses(classesRes.data.classes);
    } catch (err) {
      console.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  // Chercher les notes par élève sélectionné
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const fetchStudentGrades = async (studentId: string) => {
    if (!studentId) return;
    setLoadingGrades(true);
    try {
      const response = await api.get(`/grades/student/${studentId}`);
      setStudentGrades(response.data);
    } catch (err) {
      console.error('Erreur chargement notes');
    } finally {
      setLoadingGrades(false);
    }
  };

  const getGradeColor = (value: number) => {
    if (value >= 16) return 'text-green-600 bg-green-50';
    if (value >= 14) return 'text-blue-600 bg-blue-50';
    if (value >= 10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">

      {/* Modal */}
      {showModal && (
        <GradeModal
          students={students}
          subjects={subjects}
          classes={classes}
          onClose={() => setShowModal(false)}
          onSave={() => {
            if (selectedStudent) fetchStudentGrades(selectedStudent);
          }}
        />
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Notes et évaluations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Saisie et consultation des notes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <span>➕</span>
          <span>Saisir une note</span>
        </button>
      </div>

      {/* Sélection élève */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">
          🔍 Consulter les notes d'un élève
        </h3>
        <div className="flex gap-3">
          <select
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              fetchStudentGrades(e.target.value);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="">Sélectionner un élève</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} — {s.class?.name ?? 'Sans classe'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes de l'élève */}
      {selectedStudent && (
        <div className="space-y-4">
          {loadingGrades ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-4xl animate-pulse mb-2">📝</div>
              <p className="text-gray-400">Chargement des notes...</p>
            </div>
          ) : studentGrades ? (
            <>
              {/* Infos élève */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                  {studentGrades.student?.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {studentGrades.student?.firstName}{' '}
                    {studentGrades.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-400 font-mono">
                    {studentGrades.student?.matricule}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-500">Total notes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {studentGrades.total}
                  </p>
                </div>
              </div>

              {/* Tableau des notes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {studentGrades.grades?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-400">Aucune note disponible</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Matière
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Type
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Période
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Note
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Appréciation
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Enseignant
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.grades?.map(
                          (grade: any, index: number) => (
                            <tr
                              key={grade.id}
                              className={`border-b border-gray-50 hover:bg-blue-50 transition ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-800">
                                  {grade.subject?.name}
                                </span>
                                <span className="ml-2 text-xs font-mono text-gray-400">
                                  {grade.subject?.code}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full capitalize">
                                  {grade.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                T{grade.period}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`font-bold text-lg px-2 py-0.5 rounded-lg ${getGradeColor(grade.value)}`}>
                                  {grade.value}/20
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs italic">
                                {grade.comment ?? '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {grade.teacher?.firstName}{' '}
                                {grade.teacher?.lastName}
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs">
                                {new Date(grade.gradedAt).toLocaleDateString(
                                  'fr-FR',
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Message si aucun élève sélectionné */}
      {!selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sélectionnez un élève
          </h3>
          <p className="text-gray-400 text-sm">
            Choisissez un élève dans la liste ci-dessus pour consulter
            ses notes, ou cliquez sur "Saisir une note" pour en ajouter
            une nouvelle.
          </p>
        </div>
      )}
    </div>
  );
}