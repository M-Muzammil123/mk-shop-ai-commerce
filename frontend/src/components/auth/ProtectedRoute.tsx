'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRouteInner({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, token, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        // Redirect to login preserving the intended destination
        const nextUrl = encodeURIComponent(pathname);
        router.replace(`/auth/login?next=${nextUrl}`);
      } else if (adminOnly && user?.role !== 'admin') {
        // Redirect unauthorized non-admins to app home
        router.replace('/app');
      }
    }
  }, [token, user, isLoading, pathname, adminOnly, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 animate-pulse">
          <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">
          Verifying secure session...
        </p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (adminOnly && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 animate-pulse">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">
            Verifying secure session...
          </p>
        </div>
      }
    >
      <ProtectedRouteInner adminOnly={adminOnly}>{children}</ProtectedRouteInner>
    </Suspense>
  );
}
