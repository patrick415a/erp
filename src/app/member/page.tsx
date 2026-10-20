"use client";

import styles from '@/components/auth/AuthForm.module.scss';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, SocialButton } from '@/components/ui/Button';
import { FormField, Input, RadioLabel } from '@/components/ui/FormControls';
import Link from 'next/link';
import axios from "axios";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";

const handleGoogleLogin = () => {
  // Google 소셜 연동을 추가할 위치입니다. 기존처럼 실제 연동은 구현되어 있지 않습니다.
};

const handleKakaoLogin = () => {
  // 카카오 로그인 로직
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  companyName: string;
  position: string;
  tel: string;
  address: string;
  detailAddress: string;
  gender: string;
}

declare global {
  interface Window {
    daum: any;
  }
}

export default function Member() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    companyName: "",
    position: "",
    tel: "",
    address: "",
    detailAddress: "",
    gender: "male",
  });

  // 1. 입력값 변경 핸들러 완성
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. 다음 우편번호 검색 API 핸들러 완성
  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          // 도로명 주소의 노출 규칙에 따라 주소를 조합
          let fullAddress = data.address;
          let extraAddress = "";

          if (data.addressType === "R") {
            if (data.bname !== "") extraAddress += data.bname;
            if (data.buildingName !== "")
              extraAddress +=
                extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
          }

          // 주소 상태 업데이트
          setFormData((prev) => ({
            ...prev,
            address: fullAddress,
          }));
        },
      }).open();
    } else {
      alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 3. 폼 제출 및 백엔드 전송 로직 완성
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 검사 (비밀번호 확인)
    if (formData.password !== formData.repeatPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // Spring Boot 서버로 POST 요청 (CORS 설정 및 포트에 맞게 URL 수정 필요)
      const response = await axios.post("http://127.0.0.1:8080/api/members/register", formData);

      if (response.status === 200 || response.status === 201) {
        alert("회원가입이 완료되었습니다!");
        router.push("/"); // 로그인 페이지로 이동
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <AuthLayout title="회원가입" description="계정 정보를 등록하고 시스템을 시작하세요." wide>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <FormField label="이름" required htmlFor="firstName">
            <Input type="text" id="firstName" name="firstName" placeholder="이름을 입력하세요" value={formData.firstName} onChange={handleChange} required />
          </FormField>
          <FormField label="성" required htmlFor="lastName">
            <Input type="text" id="lastName" name="lastName" placeholder="성을 입력하세요" value={formData.lastName} onChange={handleChange} required />
          </FormField>
          <div className={styles.full}><FormField label="이메일" required htmlFor="email">
            <Input type="email" id="email" name="email" placeholder="이메일을 입력하세요" value={formData.email} onChange={handleChange} required />
          </FormField></div>
          <FormField label="비밀번호" required htmlFor="password">
            <Input type="password" id="password" name="password" placeholder="비밀번호를 입력하세요" value={formData.password} onChange={handleChange} required />
          </FormField>
          <FormField label="비밀번호 확인" required htmlFor="repeatPassword">
            <Input type="password" id="repeatPassword" name="repeatPassword" placeholder="비밀번호를 다시 입력하세요" value={formData.repeatPassword} onChange={handleChange} required />
          </FormField>
          <FormField label="성별" className={styles.full}>
            <div className={styles.radioGroup} role="radiogroup" aria-label="성별">
              <RadioLabel><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />남자</RadioLabel>
              <RadioLabel><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />여자</RadioLabel>
              <RadioLabel><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} />선택안함</RadioLabel>
            </div>
          </FormField>
          <FormField label="회사명" htmlFor="companyName">
            <Input type="text" id="companyName" name="companyName" placeholder="회사명을 입력하세요" value={formData.companyName} onChange={handleChange} />
          </FormField>
          <FormField label="직급" htmlFor="position">
            <Input type="text" id="position" name="position" placeholder="직급을 입력하세요" value={formData.position} onChange={handleChange} />
          </FormField>
          <div className={styles.full}><FormField label="전화번호" htmlFor="tel">
            <Input type="text" id="tel" name="tel" placeholder="전화번호를 입력하세요" value={formData.tel} onChange={handleChange} />
          </FormField></div>
          <FormField label="주소" htmlFor="address" className={styles.full}>
            <div className={styles.address}>
              <Input type="text" id="address" name="address" placeholder="주소 검색으로 입력하세요" value={formData.address} readOnly />
              <Button type="button" variant="outline" onClick={handleAddressSearch}>주소 검색</Button>
            </div>
          </FormField>
          <div className={styles.full}><FormField label="상세주소" htmlFor="detailAddress">
            <Input type="text" id="detailAddress" name="detailAddress" placeholder="상세주소를 입력하세요" value={formData.detailAddress} onChange={handleChange} />
          </FormField></div>
        </div>
        <Button type="submit" fullWidth className={styles.submit}>회원가입 완료</Button>
        <div className={styles.divider}>소셜 계정으로 가입</div>
        <div className={styles.social}>
          <SocialButton type="button" provider="google" onClick={handleGoogleLogin}>Google로 가입</SocialButton>
          <SocialButton type="button" provider="kakao" onClick={handleKakaoLogin}>Kakao로 가입</SocialButton>
        </div>
      </form>
      <div className={styles.links}><Link href="/forgot">비밀번호 찾기</Link><Link href="/">로그인으로 돌아가기</Link></div>
    </AuthLayout>
  );
}
