"use client";

import styles from '@/components/auth/AuthForm.module.scss';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormControls';
import Link from 'next/link';
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post("http://127.0.0.1:8080/api/members/forgot-password", { email });
      alert("이메일로 임시 비밀번호가 발송되었습니다. 확인 후 로그인해주세요.");
      router.push("/"); // 메인 로그인 화면으로 이동
    } catch (error: any) {
      alert(error.response?.data || "메일 발송에 실패했습니다. 이메일을 확인해주세요.");
    }
  };

  return (
    <AuthLayout title="비밀번호 찾기" description="가입한 이메일로 임시 비밀번호를 보내드립니다.">
      <form onSubmit={handleResetPassword} className={styles.form}>
        <FormField label="이메일" required htmlFor="resetEmail">
          <Input id="resetEmail" type="email" placeholder="가입한 이메일을 입력하세요" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>
        <Button type="submit" fullWidth className={styles.submit}>임시 비밀번호 받기</Button>
      </form>
      <div className={styles.links}><Link href="/member">회원가입</Link><Link href="/">로그인으로 돌아가기</Link></div>
    </AuthLayout>
  );

}
