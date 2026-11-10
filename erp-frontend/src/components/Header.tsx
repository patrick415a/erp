'use client';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLogout } from '@/store/authSlice';
import { Brand } from './Brand';
import styles from '@/assets/layout/Header.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import { Icon } from './ui/Icon';
import AlertModal from '@/components/modal/AlertModal';

const links = [
  ['/dashboard', '대시보드'],
  ['/dashboard/production', '생산관리'],
  ['/dashboard/inventory', '재고관리'],
  ['/dashboard/hr', '인사관리'],
  ['/dashboard/settings', '기준정보'],
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  // 기존 로그아웃 처리: 토큰과 Axios 헤더를 지우고 로그인으로 이동합니다.

  useEffect(() => {
    let active = true;
    const fetchUserName = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUserName('');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8080/api/members/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { firstName, lastName } = response.data;

        //성 + 이름
        const fullName = `${lastName ?? ''}${firstName ?? ''}`.trim();

        if (active) {
          setUserName(fullName);
        }
      } catch (error) {
        console.error('회원 이름 조회 실패: ', error);

        if (active) {
          setUserName('');
        }
      }
    };
    fetchUserName();

    return () => {
      active = false;
    };
  }, []);

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(setLogout());
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleMyPage = () => {
    router.push('/dashboard/mypage');
  };

  return (
    <>
      <header className={styles.header}>
        <Brand compact />
        <nav className={styles.navigation} aria-label="주 메뉴">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.active : ''}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.userSection}>
          <button className={styles.avatar} onClick={handleMyPage}>
            {userName ? userName.charAt(0) : '관'}
          </button>

          <button className={styles.userName} onClick={handleMyPage}>
            {userName ? `${userName}님` : '관리자님'}
          </button>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            aria-label="로그아웃"
          >
            <Icon name="logout" size={15} />
            <span>로그아웃</span>
          </button>
        </div>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Icon name={isMobileMenuOpen ? 'close' : 'menu'} size={23} />
        </button>
        <nav
          id="mobile-navigation"
          className={styles.mobileNav}
          hidden={!isMobileMenuOpen}
          aria-label="모바일 메뉴"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              onNavigate={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link href="/dashboard/mypage" onNavigate={() => setIsMobileMenuOpen(false)}>
            마이페이지
          </Link>
          <button
            type="button"
            className={buttons.button}
            data-variant="ghost"
            data-full-width
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </nav>
      </header>
      <AlertModal
        isOpen={isModalOpen}
        message="로그아웃되었습니다"
        status="success"
        onClose={handleCloseModal}
      />
    </>
  );
}
