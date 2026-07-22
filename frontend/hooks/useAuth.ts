'use client';

import api from "@/lib/axios";
import { AuthResponse, User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null >(null);

    const login = async(email:string, password: string)=> {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                email,
                password
            });

            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            switch(user.role) {
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
                case 'ACCOUNTANT':
                    router.push('/accountant/dashboard');
                    break;
                default:
                    router.push('/login');
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ?? 'Email ou mot de passe incorrect'
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = ()=> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getUser = (): User | null => {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };

    const isAuthenticated = (): boolean=> {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('token');
    };

    return { login, logout, getUser, isAuthenticated, loading, error};
};

