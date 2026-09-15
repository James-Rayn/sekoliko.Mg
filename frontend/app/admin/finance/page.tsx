'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function FinancePage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [unpaid, setUnpaid] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [academicYear] = useState('2024-2025');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    name: '',
    amount: '',
    academicYear: '2024-2025',
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashRes, paymentsRes, feeTypesRes, unpaidRes] = await Promise.all([
        api.get(`/finance/dashboard?academicYear=${academicYear}`),
        api.get(`/finance/payments?academicYear=${academicYear}`),
        api.get(`/finance/fee-types?academicYear=${academicYear}`),
        api.get(`/finance/unpaid?academicYear=${academicYear}`),
      ]);
      setDashboard(dashRes.data);
      setPayments(paymentsRes.data.payments);
      setFeeTypes(feeTypesRes.data.feeTypes);
      setUnpaid(unpaidRes.data.students);
    } catch (err) {
      console.error('Erreur chargement finance');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeeType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/fee-types', {
        ...feeForm,
        amount: parseFloat(feeForm.amount),
      });
      setShowFeeModal(false);
      setFeeForm({
        name: '',
        amount: '',
        academicYear: '2024-2025',
        dueDate: '',
        description: '',
      });
      fetchAll();
    } catch (err: any) {
      console.error('Erreur création frais:', err.response?.data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">💰</div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Modal création frais */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <Link
                href="/admin/finance/payments/new"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                💳 Enregistrer un paiement
              </Link>
              <h2 className="text-lg font-bold text-gray-800">
                ➕ Nouveau type de frais
              </h2>
              <button
                onClick={() => setShowFeeModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateFeeType} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                  placeholder="Ex: Frais de scolarité T1"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (Ar) *
                </label>
                <input
                  type="number"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  placeholder="Ex: 150000"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date limite
                </label>
                <input
                  type="date"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={feeForm.description}
                  onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  ✅ Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion financière
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Année scolaire {academicYear}
          </p>
        </div>
        <button
          onClick={() => setShowFeeModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          ➕ Nouveau type de frais
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">💚 Encaissé</p>
          <p className="text-3xl font-bold text-green-600">
            {dashboard?.summary?.totalCollected?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.summary?.paidCount} paiement(s)
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">🟡 En attente</p>
          <p className="text-3xl font-bold text-orange-500">
            {dashboard?.summary?.totalPending?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.summary?.pendingCount} paiement(s)
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">🔴 En retard</p>
          <p className="text-3xl font-bold text-red-500">
            {dashboard?.summary?.totalLate?.toLocaleString('fr-FR')} Ar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.summary?.lateCount} paiement(s)
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'dashboard', label: '📊 Vue globale' },
            { key: 'payments', label: '💳 Paiements' },
            { key: 'feeTypes', label: '🧾 Types de frais' },
            { key: 'unpaid', label: '⚠️ Impayés' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* Vue globale */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: dashboard?.summary?.totalCollected > 0
                      ? `${(dashboard.summary.totalCollected /
                          (dashboard.summary.totalCollected +
                            dashboard.summary.totalPending +
                            dashboard.summary.totalLate)) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 Ar</span>
                <span>
                  Total :{' '}
                  {(
                    (dashboard?.summary?.totalCollected ?? 0) +
                    (dashboard?.summary?.totalPending ?? 0) +
                    (dashboard?.summary?.totalLate ?? 0)
                  ).toLocaleString('fr-FR')}{' '}
                  Ar
                </span>
              </div>
              <p className="text-sm text-gray-500 text-center">
                {dashboard?.summary?.feeTypesCount} type(s) de frais définis
              </p>
            </div>
          )}

          {/* Paiements */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              {payments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun paiement enregistré
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Élève</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Type de frais</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Montant</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Statut</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {p.student?.firstName} {p.student?.lastName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.feeType?.name}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-600">
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
                            {p.status === 'PAID' ? 'Payé'
                              : p.status === 'PENDING' ? 'En attente'
                              : 'En retard'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Types de frais */}
          {activeTab === 'feeTypes' && (
            <div className="space-y-3">
              {feeTypes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun type de frais défini
                </p>
              ) : (
                feeTypes.map((ft) => (
                  <div
                    key={ft.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{ft.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ft.description ?? 'Pas de description'}
                        {ft.dueDate && ` • Échéance : ${new Date(ft.dueDate).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {ft.amount?.toLocaleString('fr-FR')} Ar
                      </p>
                      <p className="text-xs text-gray-400">
                        {ft._count?.payments ?? 0} paiement(s)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Impayés */}
          {activeTab === 'unpaid' && (
            <div className="space-y-3">
              {unpaid.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-400 text-sm">
                    Aucun impayé — tout est à jour !
                  </p>
                </div>
              ) : (
                unpaid.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.student?.firstName} {item.student?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.student?.class?.name ?? 'Sans classe'} •{' '}
                        {item.student?.matricule}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.unpaidFees?.map((fee: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                          >
                            {fee.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        {item.totalUnpaid?.toLocaleString('fr-FR')} Ar
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}