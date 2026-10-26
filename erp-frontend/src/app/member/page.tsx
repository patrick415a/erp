'use client';

import authLayoutStyles from '@/assets/auth/AuthLayout.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Brand } from '@/components/Brand';

import styles from '@/assets/auth/AuthForm.module.scss';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useState } from 'react';

import { useDispatch } from 'react-redux';
import { setLogin } from '@/store/authSlice';
import AlertModal from '@/components/modal/AlertModal';

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
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    companyName: '',
    position: '',
    tel: '',
    address: '',
    detailAddress: '',
    gender: 'male',
  });

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  // 확인 버튼을 눌렀을 때 이동할 경로를 저장 (로그인 성공 시 대시보드로 가기 위함)
  const [nextRoute, setNextRoute] = useState('/');

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

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
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '')
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
          }

          // 주소 상태 업데이트
          setFormData((prev) => ({
            ...prev,
            address: fullAddress,
          }));
        },
      }).open();
    } else {
      setModalMessage('주소 검색 스크립트를 불러오는 중입니다.\\n 잠시 후 다시 시도해주세요.');
      setNextRoute('');
      setIsModalOpen(true);
    }
  };

  // 3. 폼 제출 및 백엔드 전송 로직 완성
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 검사 (비밀번호 확인)
    if (formData.password !== formData.repeatPassword) {
      setModalMessage('비밀번호가 일치하지 않습니다.');
      setNextRoute('');
      setIsModalOpen(true);
      return;
    }

    try {
      // Spring Boot 서버로 POST 요청 (CORS 설정 및 포트에 맞게 URL 수정 필요)
      const response = await axios.post('http://127.0.0.1:8080/api/members/register', formData);

      if (response.status === 200 || response.status === 201) {
        setModalMessage('회원가입이 완료되었습니다');

        // 만약 백엔드에서 가입과 동시에 토큰을 내려준다면 바로 전역 상태(Redux)에 저장
        const token = response.data.token;
        if(token){
          dispatch(setLogin({token}));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setNextRoute('/dashboard'); // 로그인 페이지로 이동
        }else {
          setNextRoute('/');
        }

        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      setModalMessage('회원가입에 실패했습니다.\\n 다시 시도해주세요.');
      setNextRoute('');
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <main className={`${authLayoutStyles.page} ${authLayoutStyles.wide}`}>
        <div className={authLayoutStyles.brand}>
          <Brand />
        </div>
        <section className={authLayoutStyles.card}>
          <header className={authLayoutStyles.heading}>
            <h1>회원가입</h1>
            <p>계정 정보를 등록하고 시스템을 시작하세요.</p>
          </header>

          <Script
            src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
            strategy="lazyOnload"
          />
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="firstName">
                  이름<span className={formControlsStyles.required}> *</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="이름을 입력하세요"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="lastName">
                  성<span className={formControlsStyles.required}> *</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="성을 입력하세요"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={styles.full}>
                <div className={formControlsStyles.field}>
                  <label className={formControlsStyles.label} htmlFor="email">
                    이메일<span className={formControlsStyles.required}> *</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={formControlsStyles.input}
                  />
                </div>
              </div>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="password">
                  비밀번호<span className={formControlsStyles.required}> *</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="repeatPassword">
                  비밀번호 확인<span className={formControlsStyles.required}> *</span>
                </label>
                <input
                  type="password"
                  id="repeatPassword"
                  name="repeatPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={`${formControlsStyles.field} ${styles.full}`}>
                <label className={formControlsStyles.label}>성별</label>
                <div className={styles.radioGroup} role="radiogroup" aria-label="성별">
                  <label className={formControlsStyles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                    />
                    남자
                  </label>
                  <label className={formControlsStyles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                    />
                    여자
                  </label>
                  <label className={formControlsStyles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                    />
                    선택안함
                  </label>
                </div>
              </div>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="companyName">
                  회사명
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="회사명을 입력하세요"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={formControlsStyles.input}
                />
              </div>
              <div className={formControlsStyles.field}>
                <label className={formControlsStyles.label} htmlFor="position">
                  직급
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  placeholder="직급을 입력하세요"
                  value={formData.position}
                  onChange={handleChange}
                  className={formControlsStyles.input}
                />
              </div>
              <div className={styles.full}>
                <div className={formControlsStyles.field}>
                  <label className={formControlsStyles.label} htmlFor="tel">
                    전화번호
                  </label>
                  <input
                    type="text"
                    id="tel"
                    name="tel"
                    placeholder="전화번호를 입력하세요"
                    value={formData.tel}
                    onChange={handleChange}
                    className={formControlsStyles.input}
                  />
                </div>
              </div>
              <div className={`${formControlsStyles.field} ${styles.full}`}>
                <label className={formControlsStyles.label} htmlFor="address">
                  주소
                </label>
                <div className={styles.address}>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="주소 검색으로 입력하세요"
                    value={formData.address}
                    readOnly
                    className={formControlsStyles.input}
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    data-variant="outline"
                    className={buttonStyles.button}
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div className={styles.full}>
                <div className={formControlsStyles.field}>
                  <label className={formControlsStyles.label} htmlFor="detailAddress">
                    상세주소
                  </label>
                  <input
                    type="text"
                    id="detailAddress"
                    name="detailAddress"
                    placeholder="상세주소를 입력하세요"
                    value={formData.detailAddress}
                    onChange={handleChange}
                    className={formControlsStyles.input}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              data-full-width={true}
              className={`${buttonStyles.button} ${styles.submit}`}
            >
              회원가입 완료
            </button>
            <div className={styles.divider}>소셜 계정으로 가입</div>
            <div className={styles.social}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                data-provider="google"
                className={buttonStyles.socialButton}
              >
                Google로 가입
              </button>
              <button
                type="button"
                onClick={handleKakaoLogin}
                data-provider="kakao"
                className={buttonStyles.socialButton}
              >
                Kakao로 가입
              </button>
            </div>
          </form>
          <div className={styles.links}>
            <Link href="/forgot">비밀번호 찾기</Link>
            <Link href="/">로그인으로 돌아가기</Link>
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
