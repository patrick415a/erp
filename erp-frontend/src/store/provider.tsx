"use client";

import { Provider } from "react-redux";
import { useEffect } from 'react';
import { loadUserInfo } from './authSlice';
import { store } from "./store";
import { AccessProvider } from './access';

export default function ReduxProvider({children}: {children: React.ReactNode}) {
  useEffect(() => {
    const { token } = store.getState().auth;
    if (token) void store.dispatch(loadUserInfo(token));
  }, []);

  return (
    <Provider store={store}>
      <AccessProvider>{children}</AccessProvider>
    </Provider>
  );
}
