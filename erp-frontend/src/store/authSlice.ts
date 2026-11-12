// 먼저 로그인한 토큰과 사용자 상태 관리 슬라이스
import axios from 'axios';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { memberApiUrl } from '@/app/api/members';

interface UserInfo {
  firstName: string | null;
  lastName: string | null;
}

// 인증 상태를 가질 데이터 정의
interface AuthState {
  token: string | null; // JWT 토큰 문자열 들어가거나 null 이거나
  isAuthenticate: boolean; // 로그인 여부를 나타냄
  userInfo: UserInfo | null;
  userInfoRequestId: string | null;
}

/*
  Authentication (인증)
  Authorization (인가/권한부여)
  Accounting (회계/과금)
*/
const initialState: AuthState = {
  // ssr 환경에서 에러가 나지 않도록 window 객체 존재 여부를 확인한 뒤 localstorage에서 가져옴
  token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
  isAuthenticate: typeof window !== 'undefined' ? !!localStorage.getItem("token") : false,
  userInfo: null,
  userInfoRequestId: null,
};

export const loadUserInfo = createAsyncThunk<UserInfo, string, { state: { auth: AuthState } }>(
  'auth/loadUserInfo',
  async (token, { signal }) => {
    const { data } = await axios.get<UserInfo>(memberApiUrl() + '/profile', {
      headers: { Authorization: `Bearer ${token}` },
      signal,
      timeout: 5000,
    });
    return { firstName: data.firstName, lastName: data.lastName };
  },
  {
    condition: (token, { getState }) => {
      const { auth } = getState();
      return auth.token === token && auth.userInfo === null && auth.userInfoRequestId === null;
    },
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 상태를 변경하는 함수들을 정의하는 객체
    // 로그인 성공
    setLogin: (state, action: PayloadAction<{ token: string; userInfo?: UserInfo }>) => {
      state.token = action.payload.token;
      state.isAuthenticate = true;
      state.userInfo = action.payload.userInfo ?? null;
      state.userInfoRequestId = null;
      localStorage.setItem("token", action.payload.token);
    },
    setLogout: (state) => {
      state.token = null;
      state.isAuthenticate = false;
      state.userInfo = null;
      state.userInfoRequestId = null;
      localStorage.removeItem("token");
    },
    // 로그인 객체
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserInfo.pending, (state, { meta }) => {
        state.userInfoRequestId = meta.requestId;
      })
      .addCase(loadUserInfo.fulfilled, (state, { meta, payload }) => {
        if (state.userInfoRequestId !== meta.requestId) return;
        state.userInfo = payload;
        state.userInfoRequestId = null;
      })
      .addCase(loadUserInfo.rejected, (state, { meta }) => {
        if (state.userInfoRequestId === meta.requestId) state.userInfoRequestId = null;
      });
  },
});

// 컴포넌트에서 상태 변경을 위해 dispatch(상태 변경 요청 전송/발송 함수) 액션 생성 함수들을 만들어서 내보냄
export const { setLogin, setLogout } = authSlice.actions;

// 스토어(store.ts)등록을 위해 리듀서 함수를 기본값으로 내보냄
export default authSlice.reducer;
