'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface DashboardData {
  academicYear: string;
  kpis: {
    students: { total: number; active: number; inactive: number };
    teachers: { total: number; active: number; inactive: number };
    classes: number;
    subjects: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
    attendanceRate: string;
  };
  finance: {
    collected: number;
    pending: number;
    late: number;
    total: number;
  };
  pedagogy: {
    schoolAverage: string;
    activeAnnouncements: number;
  };
  recent: {
    students: any[];
    payments: any[];
    absentStudents: any[];
  };
}

// ── Composant carte KPI ──────────────────────────────────
// Remplacez la fonction KpiCard par :
function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ── Composant section ────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const academicYear = '2024-2025';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          `/dashboard/admin?academicYear=${academicYear}`,
        );
        setData(response.data);
      } catch (err: any) {
        setError('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">📊</div>
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <div className="text-5xl mb-4">⚠️</div>
          <p>{error}</p>
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
            Tableau de bord 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Année scolaire {data.academicYear}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          📅 {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
    title="Élèves actifs"
    value={data.kpis.students.active}
    subtitle={`${data.kpis.students.total} au total`}
    icon="👨‍🎓"
    color="bg-blue-50"
    trend={{ value: 'Ce mois', positive: true }}
  />
  <KpiCard
    title="Enseignants"
    value={data.kpis.teachers.active}
    subtitle={`${data.kpis.teachers.total} au total`}
    icon="👨‍🏫"
    color="bg-green-50"
  />
  <KpiCard
    title="Classes actives"
    value={data.kpis.classes}
    subtitle="Cette année"
    icon="🏫"
    color="bg-purple-50"
  />
  <KpiCard
    title="Matières"
    value={data.kpis.subjects}
    subtitle="Enseignées"
    icon="📚"
    color="bg-orange-50"
  />
</div>

      {/* Ligne 2 — Présences + Finance + Pédagogie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Présences du jour */}
        <Section title="📋 Présences aujourd'hui">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Présents</span>
              </div>
              <span className="font-bold text-green-600">
                {data.attendance.present}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Absents</span>
              </div>
              <span className="font-bold text-red-600">
                {data.attendance.absent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-600">En retard</span>
              </div>
              <span className="font-bold text-orange-600">
                {data.attendance.late}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Taux d'assiduité
                </span>
                <span className="font-bold text-blue-600">
                  {data.attendance.attendanceRate}
                </span>
              </div>
              {/* Barre de progression */}
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: data.attendance.attendanceRate,
                  }}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Finance */}
        <Section title="💰 Finances">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Encaissé</span>
              <span className="font-bold text-green-600">
                {data.finance.collected.toLocaleString('fr-FR')} Ar
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="font-bold text-orange-500">
                {data.finance.pending.toLocaleString('fr-FR')} Ar
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En retard</span>
              <span className="font-bold text-red-500">
                {data.finance.late.toLocaleString('fr-FR')} Ar
              </span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="font-bold text-blue-600">
                  {data.finance.total.toLocaleString('fr-FR')} Ar
                </span>
              </div>
              {/* Barre encaissement */}
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: data.finance.total > 0
                      ? `${(data.finance.collected / data.finance.total) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Pédagogie */}
        <Section title="📝 Pédagogie">
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-1">Moyenne générale</p>
              <p className="text-5xl font-bold text-blue-600">
                {data.pedagogy.schoolAverage}
              </p>
              <p className="text-sm text-gray-400 mt-1">sur 20</p>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">Annonces actives</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                {data.pedagogy.activeAnnouncements}
              </span>
            </div>
          </div>
        </Section>
      </div>

      {/* Ligne 3 — Tableaux récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Derniers élèves inscrits */}
        <Section title="👨‍🎓 Derniers élèves inscrits">
          {data.recent.students.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucun élève inscrit récemment
            </p>
          ) : (
            <div className="space-y-2">
              {data.recent.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {student.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {student.matricule} •{' '}
                        {student.class?.name ?? 'Sans classe'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(student.enrolledAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Élèves avec le plus d'absences */}
        <Section title="⚠️ Alertes absences">
          {data.recent.absentStudents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Aucune alerte d'absence
            </p>
          ) : (
            <div className="space-y-2">
              {data.recent.absentStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-600">
                      {student.firstName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {student.matricule} •{' '}
                        {student.class?.name ?? 'Sans classe'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {student.absenceCount} abs.
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Derniers paiements */}
      <Section title="💳 Derniers paiements">
        {data.recent.payments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Aucun paiement récent
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Élève</th>
                  <th className="pb-2 font-medium">Type de frais</th>
                  <th className="pb-2 font-medium">Montant</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-2 font-medium text-gray-800">
                      {payment.student.firstName} {payment.student.lastName}
                    </td>
                    <td className="py-2 text-gray-600">
                      {payment.feeType.name}
                    </td>
                    <td className="py-2 font-medium text-blue-600">
                      {payment.amount.toLocaleString('fr-FR')} Ar
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'PENDING'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status === 'PAID'
                          ? 'Payé'
                          : payment.status === 'PENDING'
                          ? 'En attente'
                          : 'En retard'}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}