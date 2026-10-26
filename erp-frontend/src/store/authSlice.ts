// 먼저 로그인한 토큰과 사용자 상태 관리 슬라이스
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 인증 상태를 가질 데이터 정의
interface AuthState {
  token: string | null; // JWT 토큰 문자열 들어가거나 null 이거나
  isAuthenticate: boolean; // 로그인 여부를 나타냄
  userInfo: {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
  } | null;
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
  userInfo: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 상태를 변경하는 함수들을 정의하는 객체
    // 로그인 성공
    setLogin: (state, action: PayloadAction<{token: string; userInfo?: any}>) => {
      state.token = action.payload.token;
      state.isAuthenticate = true;
      if(action.payload.userInfo) {
        state.userInfo = action.payload.userInfo
      }
      localStorage.setItem("token", action.payload.token);
    },
    setLogout: (state) => {
      state.token = null;
      state.isAuthenticate = false;
      state.userInfo = null;
      localStorage.removeItem("token");
    },
    // 로그인 객체
  },
});

// 컴포넌트에서 상태 변경을 위해 dispatch(상태 변경 요청 전송/발송 함수) 액션 생성 함수들을 만들어서 내보냄
export const { setLogin, setLogout } = authSlice.actions;

// 스토어(store.ts)등록을 위해 리듀서 함수를 기본값으로 내보냄
export default authSlice.reducer;