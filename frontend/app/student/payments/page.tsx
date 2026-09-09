'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function StudentPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student?academicYear=2024-2025')
      .then((res) => {
        const id = res.data.student?.id;
        return api.get(`/finance/payments/student/${id}`);
      })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">💰</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mes paiements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Suivi de mes frais scolaires
        </p>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">
            {data?.summary?.totalPaid?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-sm text-gray-500 mt-1">💚 Payé</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">
            {data?.summary?.totalPending?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-sm text-gray-500 mt-1">🟡 En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-red-500">
            {data?.summary?.totalLate?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-sm text-gray-500 mt-1">🔴 En retard</p>
        </div>
      </div>

      {/* Liste paiements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Détail des paiements
          </h3>
        </div>
        {data?.payments?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type de frais</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date limite</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Payé le</th>
                </tr>
              </thead>
              <tbody>
                {data?.payments?.map((p: any, index: number) => (
                  <tr
                    key={p.id}
                    className={`border-t border-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {p.feeType?.name}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium">
                      {p.amount?.toLocaleString('fr-FR')} Ar
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'PENDING'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status === 'PAID' ? '✅ Payé'
                          : p.status === 'PENDING' ? '⏳ En attente'
                          : '❌ En retard'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.feeType?.dueDate
                        ? new Date(p.feeType.dueDate).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}