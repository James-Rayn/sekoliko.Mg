'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ParentPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/parent?academicYear=2024-2025')
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

  const totalPending = data?.kpis?.totalPendingAmount ?? 0;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">Paiements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Suivi des frais scolaires de vos enfants
        </p>
      </div>

      {/* Total impayés */}
      {totalPending > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">Frais en attente</p>
            <p className="text-red-600 text-2xl font-bold">
              {totalPending.toLocaleString('fr-FR')} Ar
            </p>
          </div>
        </div>
      )}

      {/* Par enfant */}
      {data?.children?.map((child: any) => (
        <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">
              {child.firstName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {child.firstName} {child.lastName}
              </p>
              <p className="text-xs text-gray-400">{child.class}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-500">Total impayé</p>
              <p className={`font-bold text-lg ${
                child.totalPendingAmount > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {child.totalPendingAmount > 0
                  ? `${child.totalPendingAmount.toLocaleString('fr-FR')} Ar`
                  : '✅ À jour'}
              </p>
            </div>
          </div>

          {child.pendingPayments?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-3">
              🎉 Tous les frais sont à jour
            </p>
          ) : (
            <div className="space-y-2">
              {child.pendingPayments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.feeType?.name}
                    </p>
                    {p.feeType?.dueDate && (
                      <p className="text-xs text-red-500">
                        Échéance : {new Date(p.feeType.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-orange-600">
                    {p.amount?.toLocaleString('fr-FR')} Ar
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}