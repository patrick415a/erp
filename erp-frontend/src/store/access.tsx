'use client';

import axios from 'axios';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { CurrentAccess, Permission } from '@/app/api/access';
import { requestCurrentAccess } from '@/app/api/erpClient';
import type { RootState } from './store';

type AccessResult = {
  token: string;
  access: CurrentAccess | null;
  status: 'ready' | 'login' | 'error';
};

interface AccessContextValue {
  access: CurrentAccess | null;
  status: AccessResult['status'] | 'loading';
  can: (permission: Permission) => boolean;
  refreshAccess: () => void;
}

const AccessContext = createContext<AccessContextValue>({
  access: null, status: 'loading', can: () => false, refreshAccess: () => {},
});

const subscribeToHydration = () => () => {};

export function AccessProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const token = useSelector((state: RootState) => state.auth.token);
  const pathname = usePathname();
  const [result, setResult] = useState<AccessResult | null>(null);
  const [revision, setRevision] = useState(0);
  const refreshAccess = useCallback(() => setRevision((current) => current + 1), []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const { signal } = controller;
    requestCurrentAccess(token, signal)
      .then((data) => {
        if (!signal.aborted) setResult({ token, access: data, status: 'ready' });
      })
      .catch((error) => {
        if (signal.aborted) return;
        const status = axios.isAxiosError(error) && error.response?.status === 401 ? 'login' : 'error';
        setResult({ token, access: null, status });
      });
    return () => controller.abort();
  }, [pathname, revision, token]);

  useEffect(() => {
    window.addEventListener('focus', refreshAccess);
    return () => window.removeEventListener('focus', refreshAccess);
  }, [refreshAccess]);

  const current = token && result?.token === token ? result : null;
  const access = current?.access ?? null;
  return (
    <AccessContext.Provider value={{
      access,
      status: !hydrated || token ? current?.status ?? 'loading' : 'login',
      can: (permission) => access?.permissions.includes(permission) ?? false,
      refreshAccess,
    }}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  return useContext(AccessContext);
}
