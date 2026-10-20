'use client';

import authLayoutStyles from '@/assets/auth/AuthLayout.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Brand } from '@/components/Brand';

import styles from '@/assets/auth/AuthForm.module.scss';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post('http://127.0.0.1:8080/api/members/forgot-password', { email });
      alert('이메일로 임시 비밀번호가 발송되었습니다. 확인 후 로그인해주세요.');
      router.push('/'); // 메인 로그인 화면으로 이동
    } catch (error: any) {
      alert(error.response?.data || '메일 발송에 실패했습니다. 이메일을 확인해주세요.');
    }
  };

  return (
    <main className={authLayoutStyles.page}>
      <div className={authLayoutStyles.brand}>
        <Brand />
      </div>
      <section className={authLayoutStyles.card}>
        <header className={authLayoutStyles.heading}>
          <h1>비밀번호 찾기</h1>
          <p>가입한 이메일로 임시 비밀번호를 보내드립니다.</p>
        </header>

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={formControlsStyles.field}>
            <label className={formControlsStyles.label} htmlFor="resetEmail">
              이메일<span className={formControlsStyles.required}> *</span>
            </label>
            <input
              id="resetEmail"
              type="email"
              placeholder="가입한 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={formControlsStyles.input}
            />
          </div>
          <button
            type="submit"
            data-full-width={true}
            className={`${buttonStyles.button} ${styles.submit}`}
          >
            임시 비밀번호 받기
          </button>
        </form>
        <div className={styles.links}>
          <Link href="/member">회원가입</Link>
          <Link href="/">로그인으로 돌아가기</Link>
        </div>
      </section>
      <footer className={authLayoutStyles.copyright}>
        © Production Management System. All rights reserved.
      </footer>
    </main>
  );
}
