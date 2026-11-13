'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { expireSession } from './authSlice';
import type { RootState } from './store';

function expirationTime(token: string): number | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useSessionExpiry() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;
    const expiresAt = expirationTime(token);
    if (expiresAt === null) return;

    let timer: number | undefined;
    const checkExpiry = () => {
      window.clearTimeout(timer);
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        dispatch(expireSession(token));
      } else {
        timer = window.setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
      }
    };

    checkExpiry();
    window.addEventListener('focus', checkExpiry);
    document.addEventListener('visibilitychange', checkExpiry);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', checkExpiry);
      document.removeEventListener('visibilitychange', checkExpiry);
    };
  }, [dispatch, token]);
}
