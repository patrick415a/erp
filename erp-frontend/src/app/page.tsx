'use client';

import authLayoutStyles from '@/assets/auth/AuthLayout.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Brand } from '@/components/Brand';

import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from '@/assets/auth/AuthForm.module.scss';
import AlertModal from '@/components/modal/AlertModal';

/*export const metadata: Metadata = {
  title: "로그인",
};*/

export default function Home() {
  const router = useRouter();

  // 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 확인 버튼을 눌렀을 때 이동할 경로를 저장 (로그인 성공 시 대시보드로 가기 위함)
  const [nextRoute, setNextRoute] = useState('/dashboard');

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // 백엔드 로그인 API 호출
      const response = await axios.post('http://127.0.0.1:8080/api/members/login', {
        email,
        password,
      });

      if (response.status === 200) {
        // 1. 백엔드에서 발급한 JWT 토큰을 localStorage에 저장
        const token = response.data.token;
        localStorage.setItem('token', token);

        // 2. 이후 모든 axios 요청 헤더에 JWT 토큰을 자동 포함하도록 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // alert("로그인 성공!");
        // router.push("/dashboard"); // 로그인 성공 후 이동할 메인 페이지 (필요에 따라 수정)
        setModalMessage('로그인성공');
        setNextRoute('/dashboard');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      // alert("이메일 또는 비밀번호를 확인해주세요.");
      setModalMessage('이메일 또는 비밀번호를 확인해주세요.');
      setNextRoute('');
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  return (
    <>
      <main className={authLayoutStyles.page}>
        <div className={authLayoutStyles.brand}>
          <Brand />
        </div>
        <section className={authLayoutStyles.card}>
          <header className={authLayoutStyles.heading}>
            <h1>로그인</h1>
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
              data-full-width={true}
              className={`${buttonStyles.button} ${styles.submit}`}
            >
              로그인
            </button>
            <div className={styles.divider}>소셜 로그인</div>
            <div className={styles.social}>
              <button type="button" data-provider="google" className={buttonStyles.socialButton}>
                Google로 로그인
              </button>
              <button type="button" data-provider="kakao" className={buttonStyles.socialButton}>
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
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
