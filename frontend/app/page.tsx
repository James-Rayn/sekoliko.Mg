'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      const parsedUser = JSON.parse(user);
      switch (parsedUser.role) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'TEACHER':
          router.push('/teacher/dashboard');
          break;
        case 'STUDENT':
          router.push('/student/dashboard');
          break;
        case 'PARENT':
          router.push('/parent/dashboard');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-6xl mb-4">🏫</div>
        <p className="text-xl">Chargement...</p>
      </div>
    </div>
  );
}