'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes')
      .then((res) => setClasses(res.data.classes))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">🏫</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mes classes</h1>
        <p className="text-gray-500 text-sm mt-1">
          {classes.length} classe(s) disponible(s)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classe) => (
          <Link
            key={classe.id}
            href={`/admin/classes/${classe.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                🏫
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{classe.name}</h3>
                <p className="text-sm text-gray-400">
                  {classe.level} • {classe.academicYear}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                👨‍🎓 {classe._count?.students ?? 0} élèves
              </span>
              <span className="text-green-600 font-medium">
                Voir détail →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}