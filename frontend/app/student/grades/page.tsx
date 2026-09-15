'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentGradesPage() {
  const [gradesData, setGradesData] = useState<any>(null);
  const [bulletin, setBulletin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [studentId, setStudentId] = useState('');
  const academicYear = '2024-2025';

  useEffect(() => {
    // Récupérer le profil élève depuis le dashboard
    api.get('/dashboard/student?academicYear=' + academicYear)
      .then((res) => {
        const id = res.data.student?.id;
        setStudentId(id);
        return api.get(`/grades/student/${id}`);
      })
      .then((res) => setGradesData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchBulletin = async () => {
    if (!studentId) return;
    try {
      const res = await api.get(
        `/grades/bulletin/${studentId}?period=${selectedPeriod}&academicYear=${academicYear}`,
      );
      setBulletin(res.data);
    } catch (err) {
      console.error('Erreur bulletin');
    }
  };

  const getGradeColor = (value: number) => {
    if (value >= 16) return 'text-green-600 bg-green-50';
    if (value >= 14) return 'text-blue-600 bg-blue-50';
    if (value >= 10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMentionColor = (mention: string) => {
    if (mention === 'Félicitations du jury') return 'text-green-700 bg-green-100';
    if (mention === "Tableau d'honneur") return 'text-blue-700 bg-blue-100';
    if (mention === 'Encouragements') return 'text-purple-700 bg-purple-100';
    if (mention === 'Admis') return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">📝</div>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!studentId || !selectedPeriod) return;
    try {
      const response = await api.get(
        `/grades/bulletin/${studentId}/pdf?period=${selectedPeriod}&academicYear=${academicYear}`,
        { responseType: 'blob' },
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `bulletin-T${selectedPeriod}-${academicYear}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement PDF');
    }
  };
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mes notes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Année scolaire {academicYear}
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'grades', label: '📝 Toutes mes notes' },
            { key: 'bulletin', label: '📋 Mon bulletin' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* Toutes les notes */}
          {activeTab === 'grades' && (
            <div>
              {gradesData?.grades?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-400">Aucune note disponible</p>
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
                      {gradesData?.grades?.map((grade: any, index: number) => (
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

          {/* Bulletin */}
          {activeTab === 'bulletin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                >
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                </select>
                <button
                  onClick={fetchBulletin}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  📋 Générer le bulletin
                </button>
              </div>

              <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              >
                <option value="1">Trimestre 1</option>
                <option value="2">Trimestre 2</option>
                <option value="3">Trimestre 3</option>
              </select>

              <button
                onClick={fetchBulletin}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                📋 Voir le bulletin
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
              >
                📥 Télécharger PDF
              </button>
            </div>

              {bulletin && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* En-tête bulletin */}
                  <div className="bg-purple-700 text-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">{bulletin.school}</h2>
                        <p className="text-purple-200 text-sm">
                          Bulletin — Trimestre {bulletin.period} — {bulletin.academicYear}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {bulletin.student?.firstName} {bulletin.student?.lastName}
                        </p>
                        <p className="text-purple-200 text-sm">
                          {bulletin.student?.class} • {bulletin.student?.matricule}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tableau matières */}
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Matière</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Coeff.</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Moyenne</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Appréciation</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Enseignant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulletin.subjects?.map((subject: any, index: number) => (
                        <tr
                          key={index}
                          className={`border-t border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {subject.subjectName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            ×{subject.coefficient}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold px-2 py-0.5 rounded ${getGradeColor(subject.average)}`}>
                              {subject.average}/20
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {subject.appreciation}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {subject.teacher}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pied bulletin */}
                  <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Moyenne générale</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {bulletin.generalAverage}/20
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Mention</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMentionColor(bulletin.mention)}`}>
                        {bulletin.mention}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}