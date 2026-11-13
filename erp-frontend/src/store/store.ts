import { configureStore } from "@reduxjs/toolkit";
import axios from 'axios';
import { erpClient } from '@/app/api/erpClient';
import authReducer, { expireSession } from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
});

if (typeof window !== 'undefined') {
  erpClient.interceptors.response.use(undefined, (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const authorization = error.config?.headers.get('Authorization');
      if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
        store.dispatch(expireSession(authorization.slice(7)));
      }
    }
    return Promise.reject(error);
  });
}

// typescript에서 사용할 RootState 및 AppDispatch 타입 정의
export type RootState = ReturnType<typeof store.getState>;

// 비동기 액션(thunk[당장 실행하지 않고 나중에 필요할 때 연산하기 위해 연산을 감싸주는 함수])등을 처리할 때 사용할 수 있는 디스패치 타입 구조 정의
export type AppDispatch = typeof store.dispatch;
