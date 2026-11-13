'use client';

import authLayoutStyles from '@/assets/auth/AuthLayout.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Brand } from '@/components/Brand';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { useDispatch } from 'react-redux';
import { store, type AppDispatch } from '@/store/store';
import { loadUserInfo, setLogin } from '@/store/authSlice';
import { memberApiUrl } from '@/app/api/members';
import { firstAvailableMenu } from '@/app/api/access';
import { requestCurrentAccess } from '@/app/api/erpClient';

import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import styles from '@/assets/auth/AuthForm.module.scss';
import AlertModal, { type AlertNotice } from '@/components/modal/AlertModal';

type SocialProvider = 'google' | 'kakao';

/*export const metadata: Metadata = {
  title: "로그인",
};*/

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 모달 상태 관리
  const [notice, setNotice] = useState<AlertNotice | null>(null);

  // 확인 버튼을 눌렀을 때 이동할 경로를 저장 (로그인 성공 시 대시보드로 가기 위함)
  const [nextRoute, setNextRoute] = useState('/dashboard');
  const [isLoginPending, setIsLoginPending] = useState(false);

  const showLoginError = useCallback((message: string) => {
    setNotice({ message, status: 'error' });
    setNextRoute('');
  }, []);

  const completeLogin = useCallback(
    async (token: string, signal?: AbortSignal) => {
      dispatch(setLogin({ token }));
      const [, access] = await Promise.all([
        dispatch(loadUserInfo(token)),
        requestCurrentAccess(token, signal).catch(() => null),
      ]);
      if (signal?.aborted || store.getState().auth.token !== token) return;
      setNotice({ message: '로그인되었습니다.', status: 'success' });
      setNextRoute(access ? firstAvailableMenu(access) : '/dashboard');
    },
    [dispatch],
  );

  useEffect(() => {
    const controller = new AbortController();
    const start = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      if (!code && !state && !error) return;

      for (const key of [
        'code',
        'state',
        'error',
        'error_description',
        'scope',
        'authuser',
        'prompt',
      ]) {
        url.searchParams.delete(key);
      }
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      if (!code || !state || error) {
        showLoginError(
          error === 'access_denied'
            ? '소셜 로그인이 취소되었습니다.'
            : '소셜 로그인 요청을 확인할 수 없습니다.',
        );
        return;
      }

      setIsLoginPending(true);
      axios
        .post<{ token: string }>(
          memberApiUrl() + '/oauth/complete',
          { code, state },
          {
            withCredentials: true,
            signal: controller.signal,
            timeout: 25000,
          },
        )
        .then(({ data }) => {
          if (!data.token) throw new Error('Missing login token');
          return completeLogin(data.token, controller.signal);
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            const conflict = axios.isAxiosError(error) && error.response?.status === 409;
            showLoginError(
              conflict
                ? '같은 이메일로 가입한 계정이 있습니다. 기존 방식으로 로그인해 주세요.'
                : '소셜 로그인에 실패했습니다. 처음부터 다시 시도해 주세요.',
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoginPending(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(start);
      controller.abort();
    };
  }, [completeLogin, showLoginError]);

  const startSocialLogin = async (provider: SocialProvider) => {
    setIsLoginPending(true);
    try {
      const { data } = await axios.post<{ authorizationUrl: string }>(
        memberApiUrl() + '/oauth/' + provider + '/authorize',
        null,
        { withCredentials: true, timeout: 8000 },
      );
      window.location.assign(data.authorizationUrl);
    } catch {
      showLoginError('소셜 로그인에 실패했습니다. 이메일로 로그인하거나 잠시 후 다시 시도해 주세요.');
      setIsLoginPending(false);
    }
  };

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoginPending) return;

    setIsLoginPending(true);
    try {
      // 백엔드 로그인 API 호출
      const response = await axios.post<{ token: string }>(memberApiUrl() + '/login', {
        email,
        password,
      });

      if (response.status === 200) await completeLogin(response.data.token);
    } catch (error) {
      console.error('로그인 에러:', error);
      showLoginError('이메일 또는 비밀번호를 확인해 주세요.');
    } finally {
      setIsLoginPending(false);
    }
  };

  const handleCloseModal = () => {
    setNotice(null);
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  return (
    <>
      <main className={authLayoutStyles.page}>
        <div className={authLayoutStyles.brand}>
          <Brand href={null} />
        </div>
        <section className={authLayoutStyles.card}>
          <header className={authLayoutStyles.heading}>
            <div className={authLayoutStyles.headingRow}>
              <h1>로그인</h1>
              <ThemeToggle />
            </div>
            <p>사내 계정으로 접속하여 업무를 시작하세요.</p>
          </header>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={formControlsStyles.field}>
              <label className={formControlsStyles.label} htmlFor="exampleInputEmail">
                이메일<span className={formControlsStyles.required}> *</span>
              </label>
              <input
                type="email"
                id="exampleInputEmail"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={formControlsStyles.input}
              />
            </div>
            <div className={formControlsStyles.field}>
              <label className={formControlsStyles.label} htmlFor="exampleInputPassword">
                비밀번호<span className={formControlsStyles.required}> *</span>
              </label>
              <input
                type="password"
                id="exampleInputPassword"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={formControlsStyles.input}
              />
            </div>
            <div className={styles.checkbox}>
              <input type="checkbox" id="customCheck" />
              <label htmlFor="customCheck" className={formControlsStyles.checkboxLabel}>
                로그인 상태 유지
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoginPending}
              data-full-width={true}
              className={`${buttonStyles.button} ${styles.submit}`}
            >
              로그인
            </button>
            <div className={styles.divider}>소셜 로그인</div>
            <div className={styles.social}>
              <button
                type="button"
                data-provider="google"
                className={buttonStyles.socialButton}
                disabled={isLoginPending}
                onClick={() => void startSocialLogin('google')}
              >
                Google로 로그인
              </button>
              <button
                type="button"
                data-provider="kakao"
                className={buttonStyles.socialButton}
                disabled={isLoginPending}
                onClick={() => void startSocialLogin('kakao')}
              >
                Kakao로 로그인
              </button>
            </div>
          </form>
          <div className={styles.links}>
            <Link href="/member">회원가입</Link>
            <Link href="/forgot">비밀번호 찾기</Link>
          </div>
        </section>
        <footer className={authLayoutStyles.copyright}>
          © Production Management System. All rights reserved.
        </footer>
      </main>
      {notice && <AlertModal isOpen {...notice} onClose={handleCloseModal} />}
    </>
  );
}
