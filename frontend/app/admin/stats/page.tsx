'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
];

const academicYear = '2024-2025';

export default function StatsPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, studentsRes, classesRes, subjectsRes, financeRes] =
        await Promise.all([
          api.get(`/dashboard/admin?academicYear=${academicYear}`),
          api.get('/students'),
          api.get('/classes'),
          api.get('/subjects'),
          api.get(`/finance/dashboard?academicYear=${academicYear}`),
        ]);

      setDashboard(dashRes.data);
      setStudents(studentsRes.data.students);
      setClasses(classesRes.data.classes);
      setSubjects(subjectsRes.data.subjects);
      setFinance(financeRes.data);
    } catch (err) {
      console.error('Erreur chargement stats');
    } finally {
      setLoading(false);
    }
  };

  // ── Données pour les graphiques ──────────────────────────

  // Répartition élèves par classe
  const studentsByClass = classes
    .map((c) => ({
      name: c.name,
      élèves: c._count?.students ?? 0,
      capacité: c.capacity,
    }))
    .filter((c) => c.élèves > 0)
    .sort((a, b) => b.élèves - a.élèves);

  // Répartition genre
  const boys = students.filter((s) => s.gender === 'MALE').length;
  const girls = students.filter((s) => s.gender === 'FEMALE').length;
  const genderData = [
    { name: 'Garçons', value: boys },
    { name: 'Filles', value: girls },
  ];

  // Finance
  const financeData = [
    {
      name: 'Encaissé',
      montant: finance?.summary?.totalCollected ?? 0,
      fill: '#10b981',
    },
    {
      name: 'En attente',
      montant: finance?.summary?.totalPending ?? 0,
      fill: '#f59e0b',
    },
    {
      name: 'En retard',
      montant: finance?.summary?.totalLate ?? 0,
      fill: '#ef4444',
    },
  ];

  // Présences du jour
  const attendanceData = [
    { name: 'Présents', value: dashboard?.attendance?.present ?? 0, fill: '#10b981' },
    { name: 'Absents', value: dashboard?.attendance?.absent ?? 0, fill: '#ef4444' },
    { name: 'En retard', value: dashboard?.attendance?.late ?? 0, fill: '#f59e0b' },
  ];

  // Coefficients des matières
  const subjectCoeffData = subjects
    .map((s) => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
      coefficient: s.coefficient,
    }))
    .sort((a, b) => b.coefficient - a.coefficient);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">📊</div>
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Statistiques avancées
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Année scolaire {academicYear}
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total élèves',
            value: dashboard?.kpis?.students?.total ?? 0,
            sub: `${dashboard?.kpis?.students?.active ?? 0} actifs`,
            icon: '👨‍🎓',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Enseignants',
            value: dashboard?.kpis?.teachers?.total ?? 0,
            sub: `${dashboard?.kpis?.teachers?.active ?? 0} actifs`,
            icon: '👨‍🏫',
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Moyenne école',
            value: `${dashboard?.pedagogy?.schoolAverage ?? 'N/A'}/20`,
            sub: 'Toutes matières',
            icon: '📝',
            color: 'bg-purple-50 text-purple-600',
          },
          {
            label: 'Taux assiduité',
            value: dashboard?.attendance?.attendanceRate ?? 'N/A',
            sub: "Aujourd'hui",
            icon: '✅',
            color: 'bg-orange-50 text-orange-600',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Vue générale' },
            { key: 'students', label: '👨‍🎓 Élèves' },
            { key: 'attendance', label: '✅ Présences' },
            { key: 'finance', label: '💰 Finance' },
            { key: 'subjects', label: '📚 Matières' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* Vue générale */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Élèves par classe */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  🏫 Effectifs par classe
                </h3>
                {studentsByClass.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Aucune donnée disponible
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentsByClass}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="élèves"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Élèves inscrits"
                      />
                      <Bar
                        dataKey="capacité"
                        fill="#e5e7eb"
                        radius={[4, 4, 0, 0]}
                        name="Capacité max"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Finance résumé */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  💰 Situation financière
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={financeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(v: any) =>
                        `${Number(v).toLocaleString('fr-FR')} Ar`
                      }
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
                      {financeData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Élèves */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Répartition genre */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    👥 Répartition par genre
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {genderData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={index === 0 ? '#3b82f6' : '#ec4899'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [`${v} élèves`]}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Stats genre */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{boys}</p>
                      <p className="text-sm text-gray-500 mt-1">👦 Garçons</p>
                      <p className="text-xs text-gray-400">
                        {students.length > 0
                          ? `${((boys / students.length) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-pink-600">{girls}</p>
                      <p className="text-sm text-gray-500 mt-1">👧 Filles</p>
                      <p className="text-xs text-gray-400">
                        {students.length > 0
                          ? `${((girls / students.length) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Élèves par classe */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    🏫 Effectifs par classe
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={studentsByClass}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="élèves"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                      >
                        {studentsByClass.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tableau récapitulatif classes */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  📋 Récapitulatif des classes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Classe</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Niveau</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">Élèves</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">Capacité</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">Taux remplissage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((classe, index) => {
                        const fill = Math.round(
                          ((classe._count?.students ?? 0) / classe.capacity) * 100,
                        );
                        return (
                          <tr
                            key={classe.id}
                            className={`border-t border-gray-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {classe.name}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {classe.level}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">
                              {classe._count?.students ?? 0}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500">
                              {classe.capacity}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      fill >= 90
                                        ? 'bg-red-500'
                                        : fill >= 70
                                        ? 'bg-orange-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(fill, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-10">
                                  {fill}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Présences */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie présences */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    📋 Présences aujourd'hui
                  </h3>
                  {attendanceData.every((d) => d.value === 0) ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-gray-400 text-sm">
                        Aucun appel effectué aujourd'hui
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={attendanceData.filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={50}
                          dataKey="value"
                          label={({ name, value, percent }) =>
                            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [`${v} élèves`]}
                          contentStyle={{ borderRadius: '8px' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Stats présences */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    📊 Résumé assiduité
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Présents',
                        value: dashboard?.attendance?.present ?? 0,
                        color: 'bg-green-500',
                        bg: 'bg-green-50',
                        text: 'text-green-700',
                      },
                      {
                        label: 'Absents',
                        value: dashboard?.attendance?.absent ?? 0,
                        color: 'bg-red-500',
                        bg: 'bg-red-50',
                        text: 'text-red-700',
                      },
                      {
                        label: 'En retard',
                        value: dashboard?.attendance?.late ?? 0,
                        color: 'bg-orange-500',
                        bg: 'bg-orange-50',
                        text: 'text-orange-700',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`${item.bg} rounded-xl p-4 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className={`font-medium ${item.text}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-2xl font-bold ${item.text}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}

                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-700">
                          Taux d'assiduité
                        </span>
                        <span className="text-2xl font-bold text-blue-700">
                          {dashboard?.attendance?.attendanceRate ?? 'N/A'}
                        </span>
                      </div>
                      <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: dashboard?.attendance?.attendanceRate ?? '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Finance */}
          {activeTab === 'finance' && (
            <div className="space-y-6">

              {/* Graphique barres finance */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  💰 Situation financière détaillée
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 13, fill: '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={(v) =>
                        `${(v / 1000000).toFixed(1)}M`
                      }
                    />
                    <Tooltip
                      formatter={(v: any) =>
                        `${Number(v).toLocaleString('fr-FR')} Ar`
                      }
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
                      {financeData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie finance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    📊 Répartition des paiements
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={financeData.filter((d) => d.montant > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="montant"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {financeData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) =>
                          `${Number(v).toLocaleString('fr-FR')} Ar`
                        }
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* KPIs finance */}
                <div className="space-y-3">
                  {[
                    {
                      label: '💚 Total encaissé',
                      value: finance?.summary?.totalCollected ?? 0,
                      count: finance?.summary?.paidCount ?? 0,
                      color: 'text-green-600',
                      bg: 'bg-green-50',
                    },
                    {
                      label: '🟡 En attente',
                      value: finance?.summary?.totalPending ?? 0,
                      count: finance?.summary?.pendingCount ?? 0,
                      color: 'text-orange-600',
                      bg: 'bg-orange-50',
                    },
                    {
                      label: '🔴 En retard',
                      value: finance?.summary?.totalLate ?? 0,
                      count: finance?.summary?.lateCount ?? 0,
                      color: 'text-red-600',
                      bg: 'bg-red-50',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`${item.bg} rounded-xl p-4 flex items-center justify-between`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.count} paiement(s)
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${item.color}`}>
                        {Number(item.value).toLocaleString('fr-FR')} Ar
                      </p>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="bg-blue-600 rounded-xl p-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      💙 Total global
                    </p>
                    <p className="text-xl font-bold text-white">
                      {(
                        (finance?.summary?.totalCollected ?? 0) +
                        (finance?.summary?.totalPending ?? 0) +
                        (finance?.summary?.totalLate ?? 0)
                      ).toLocaleString('fr-FR')}{' '}
                      Ar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matières */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">

              {/* Coefficients */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  📚 Coefficients par matière
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectCoeffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={[0, 'dataMax + 1']}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Bar
                      dataKey="coefficient"
                      radius={[4, 4, 0, 0]}
                      name="Coefficient"
                    >
                      {subjectCoeffData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau matières */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  📋 Détail des matières
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Matière
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">
                          Code
                        </th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">
                          Coefficient
                        </th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">
                          Enseignants
                        </th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500">
                          Notes saisies
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject, index) => (
                        <tr
                          key={subject.id}
                          className={`border-t border-gray-50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {subject.name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {subject.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              subject.coefficient >= 4
                                ? 'bg-red-100 text-red-700'
                                : subject.coefficient >= 3
                                ? 'bg-orange-100 text-orange-700'
                                : subject.coefficient >= 2
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              ×{subject.coefficient}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {subject.teachers?.length ?? 0}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                              {subject._count?.grades ?? 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}