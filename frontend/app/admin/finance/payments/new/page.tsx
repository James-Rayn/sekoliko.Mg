'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NewPaymentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentPayments, setStudentPayments] = useState<any>(null);

  const [form, setForm] = useState({
    studentId: '',
    feeTypeId: '',
    amount: '',
    method: 'espèces',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/students'),
      api.get('/finance/fee-types?academicYear=2024-2025'),
      api.get('/classes'),
    ]).then(([studentsRes, feeTypesRes, classesRes]) => {
      setStudents(studentsRes.data.students);
      setFeeTypes(feeTypesRes.data.feeTypes);
      setClasses(classesRes.data.classes);
    });
  }, []);

  // Charger les infos de l'élève sélectionné
  const handleStudentSelect = async (studentId: string) => {
    setForm({ ...form, studentId, feeTypeId: '', amount: '' });
    if (!studentId) {
      setSelectedStudent(null);
      setStudentPayments(null);
      return;
    }

    try {
      const [studentRes, paymentsRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        api.get(`/finance/payments/student/${studentId}`),
      ]);
      setSelectedStudent(studentRes.data);
      setStudentPayments(paymentsRes.data);
    } catch (err) {
      console.error('Erreur chargement élève');
    }
  };

  // Pré-remplir le montant quand on sélectionne un type de frais
  const handleFeeTypeSelect = (feeTypeId: string) => {
    const feeType = feeTypes.find((f) => f.id === feeTypeId);
    setForm({
      ...form,
      feeTypeId,
      amount: feeType ? String(feeType.amount) : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/finance/payments', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess(true);

      // Recharger les paiements de l'élève
      if (form.studentId) {
        const res = await api.get(
          `/finance/payments/student/${form.studentId}`,
        );
        setStudentPayments(res.data);
      }

      // Réinitialiser le formulaire partiel
      setForm((prev) => ({
        ...prev,
        feeTypeId: '',
        amount: '',
        notes: '',
      }));

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Une erreur est survenue',
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les élèves par classe
  const filteredStudents = filterClass
    ? students.filter((s) => s.class?.id === filterClass)
    : students;

  // Frais non encore payés pour cet élève
  const unpaidFeeTypes = feeTypes.filter((ft) => {
    if (!studentPayments) return true;
    const paid = studentPayments.payments?.find(
      (p: any) => p.feeType?.name === ft.name && p.status === 'PAID',
    );
    return !paid;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Payé', color: 'bg-green-100 text-green-700' };
      case 'PENDING':
        return { label: 'En attente', color: 'bg-orange-100 text-orange-700' };
      case 'LATE':
        return { label: 'En retard', color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          ← Retour
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Enregistrer un paiement
          </h1>
          <p className="text-gray-400 text-sm">
            Sélectionnez un élève et enregistrez son paiement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulaire */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              💳 Formulaire de paiement
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">
                ✅ Paiement enregistré avec succès !
              </div>
            )}

            <div className="space-y-4">

              {/* Filtre classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par classe
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => {
                    setFilterClass(e.target.value);
                    setForm({ ...form, studentId: '' });
                    setSelectedStudent(null);
                    setStudentPayments(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Toutes les classes</option>
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
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Sélectionner un élève</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} —{' '}
                      {s.class?.name ?? 'Sans classe'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de frais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de frais *
                </label>
                <select
                  value={form.feeTypeId}
                  onChange={(e) => handleFeeTypeSelect(e.target.value)}
                  required
                  disabled={!form.studentId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {form.studentId
                      ? 'Sélectionner un type de frais'
                      : 'Sélectionnez d\'abord un élève'}
                  </option>
                  {unpaidFeeTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.name} — {ft.amount.toLocaleString('fr-FR')} Ar
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (Ar) *
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Ex: 150000"
                  required
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'espèces', label: '💵 Espèces' },
                    { value: 'virement', label: '🏦 Virement' },
                    { value: 'mobile money', label: '📱 Mobile Money' },
                    { value: 'chèque', label: '📄 Chèque' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setForm({ ...form, method: method.value })}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                        form.method === method.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Remarques sur le paiement..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
                />
              </div>

              {/* Récapitulatif */}
              {form.studentId && form.feeTypeId && form.amount && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    📋 Récapitulatif
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Élève</span>
                      <span className="font-medium text-gray-800">
                        {selectedStudent?.firstName} {selectedStudent?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais</span>
                      <span className="font-medium text-gray-800">
                        {feeTypes.find((f) => f.id === form.feeTypeId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {parseFloat(form.amount).toLocaleString('fr-FR')} Ar
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode</span>
                      <span className="font-medium text-gray-800 capitalize">
                        {form.method}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton */}
              <button
                onClick={handleSubmit}
                disabled={loading || !form.studentId || !form.feeTypeId || !form.amount}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  '✅ Enregistrer le paiement'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Historique paiements élève */}
        <div className="space-y-4">

          {/* Infos élève */}
          {selectedStudent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
                  {selectedStudent.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedStudent.matricule} •{' '}
                    {selectedStudent.class?.name ?? 'Sans classe'}
                  </p>
                </div>
              </div>

              {/* Résumé financier */}
              {studentPayments && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {studentPayments.summary?.totalPaid?.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">Payé (Ar)</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-orange-500">
                      {studentPayments.summary?.totalPending?.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">En attente</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-red-500">
                      {studentPayments.summary?.balance?.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">Solde dû</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historique paiements */}
          {studentPayments && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">
                  📋 Historique des paiements
                </h3>
              </div>

              {studentPayments.payments?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-400 text-sm">
                    Aucun paiement enregistré
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {studentPayments.payments?.map((payment: any) => {
                    const status = getStatusConfig(payment.status);
                    return (
                      <div
                        key={payment.id}
                        className="px-5 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {payment.feeType?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            {payment.method && (
                              <span className="text-xs text-gray-400 capitalize">
                                • {payment.method}
                              </span>
                            )}
                          </div>
                          {payment.paidAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Payé le{' '}
                              {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-gray-800">
                          {payment.amount?.toLocaleString('fr-FR')} Ar
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              {studentPayments.payments?.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total dû
                  </span>
                  <span className="font-bold text-blue-600">
                    {studentPayments.summary?.totalDue?.toLocaleString('fr-FR')} Ar
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Message si pas d'élève sélectionné */}
          {!selectedStudent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Sélectionnez un élève
              </h3>
              <p className="text-gray-400 text-sm">
                L'historique des paiements apparaîtra ici
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Raccourci — générer factures */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-800">
            💡 Générer les factures automatiquement
          </p>
          <p className="text-sm text-blue-600 mt-0.5">
            Créez automatiquement toutes les factures en attente pour un élève
          </p>
        </div>
        <button
          onClick={async () => {
            if (!form.studentId) {
              alert('Sélectionnez d\'abord un élève');
              return;
            }
            try {
              await api.post(
                `/finance/invoices/${form.studentId}?academicYear=2024-2025`,
              );
              const res = await api.get(
                `/finance/payments/student/${form.studentId}`,
              );
              setStudentPayments(res.data);
              alert('Factures générées avec succès !');
            } catch (err: any) {
              alert(err.response?.data?.message ?? 'Erreur génération factures');
            }
          }}
          disabled={!form.studentId}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition"
        >
          🧾 Générer les factures
        </button>
      </div>
    </div>
  );
}