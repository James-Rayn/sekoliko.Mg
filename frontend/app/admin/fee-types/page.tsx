'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeeTypesPage() {
  const router = useRouter();

  // Rediriger vers la page finance onglet frais
  useEffect(() => {
    router.replace('/admin/finance');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl animate-pulse mb-4">💰</div>
        <p className="text-gray-400">Redirection...</p>
      </div>
    </div>
  );
}