'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

/**
 * Redirects the user if they are not authenticated or if their role
 * does not match the required role for this page.
 *
 * @param requiredRole - 'recruiter' | 'applicant'
 */
export function useRoleGuard(requiredRole: 'recruiter' | 'applicant') {
    const router = useRouter();

    useEffect(() => {
        const token = api.getToken();
        const user = api.getUser();

        if (!token || !user) {
            // Not logged in — send to login
            router.replace('/sign-up-login-screen');
            return;
        }

        if (user.role !== requiredRole) {
            // Wrong role — send to their correct portal
            const correctPath = user.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-portal';
            router.replace(correctPath);
        }
    }, [requiredRole, router]);
}
