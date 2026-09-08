'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function TeacherGradesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentGrades, setStudentGrades] = useState<any>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState('');

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

  useEffect(() => {
    Promise.all([
      api.get('/students'),
      api.get('/subjects'),
      api.get('/classes'),
    ]).then(([sRes, subRes, cRes]) => {
      setStudents(sRes.data.students);
      setSubjects(subRes.data.subjects);
      setClasses(cRes.data.classes);
    });
  }, []);

  const filteredStudents = filterClass
    ? students.filter((s) => s.class?.id === filterClass)
    : students;

  const fetchStudentGrades = async (studentId: string) => {
    if (!studentId) return;
    setLoadingGrades(true);
    try {
      const res = await api.get(`/grades/student/${studentId}`);
      setStudentGrades(res.data);
    } catch (err) {
      console.error('Erreur notes');
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/grades', {
        ...form,
        value: parseFloat(form.value),
        period: parseInt(String(form.period)),
      });
      setSuccess(true);
      setShowModal(false);
      setForm({
        studentId: '',
        subjectId: '',
        classId: '',
        value: '',
        type: 'devoir',
        period: 1,
        academicYear: '2024-2025',
        comment: '',
      });
      if (selectedStudent) fetchStudentGrades(selectedStudent);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la saisie');
    } finally {
      setSaving(false);
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

      {/* Modal saisie note */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                📝 Saisir une note
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
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

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  >
                    <option value="">Sélectionner</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Élève *
                  </label>
                  <select
                    value={form.studentId}
                    onChange={(e) =>
                      setForm({ ...form, studentId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  >
                    <option value="">Sélectionner</option>
                    {students
                      .filter((s) =>
                        form.classId ? s.class?.id === form.classId : true,
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matière *
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) =>
                    setForm({ ...form, subjectId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                >
                  <option value="">Sélectionner</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  >
                    <option value="devoir">Devoir</option>
                    <option value="examen">Examen</option>
                    <option value="contrôle">Contrôle</option>
                    <option value="participation">Participation</option>
                  </select>
                </div>
              </div>

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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  >
                    <option value={1}>Trimestre 1</option>
                    <option value={2}>Trimestre 2</option>
                    <option value={3}>Trimestre 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année scolaire
                  </label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm({ ...form, academicYear: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appréciation
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  rows={2}
                  placeholder="Appréciation optionnelle..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium"
                >
                  {saving ? '⏳ Enregistrement...' : '✅ Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes notes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Saisie et consultation des notes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          ➕ Saisir une note
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          ✅ Note enregistrée avec succès !
        </div>
      )}

      {/* Recherche par élève */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">
          🔍 Consulter les notes d'un élève
        </h3>
        <div className="flex gap-3">
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setSelectedStudent('');
              setStudentGrades(null);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              fetchStudentGrades(e.target.value);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
          >
            <option value="">Sélectionner un élève</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} — {s.class?.name ?? 'Sans classe'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes élève */}
      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingGrades ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-3xl animate-pulse">📝</div>
            </div>
          ) : studentGrades?.grades?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-400 text-sm">Aucune note disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Matière</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Période</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Note</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Appréciation</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades?.grades?.map((grade: any, index: number) => (
                    <tr
                      key={grade.id}
                      className={`border-b border-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {grade.subject?.name}
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
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(grade.gradedAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sélectionnez un élève
          </h3>
          <p className="text-gray-400 text-sm">
            Choisissez un élève pour consulter ses notes
          </p>
        </div>
      )}
    </div>
  );
}