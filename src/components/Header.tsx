"use client";
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Brand } from './Brand';
import styles from './Header.module.scss';
import { Icon } from './ui/Icon';
import AlertModal from "@/components/modal/AlertModal";

const links = [
  ['/dashboard', '대시보드'], ['/dashboard/production', '생산관리'], ['/dashboard/inventory', '재고관리'],
  ['/dashboard/hr', '인사관리'], ['/dashboard/settings', '기준정보'],
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => { setIsMobileMenuOpen((prev) => !prev); };
  const router = useRouter();
  const pathname = usePathname();
  // 기존 로그아웃 처리: 토큰과 Axios 헤더를 지우고 로그인으로 이동합니다.

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const handleLogout = () => {
    setModalMessage('로그아웃되었습니다');
    setIsModalOpen(true);
  };

  const handleMyPage = () => {
    router.push('/dashboard/mypage');
  }

  return (
    <>
      <header className={styles.header}>
        <Brand compact />
        <nav className={styles.navigation} aria-label="주 메뉴">
          {links.map(([href, label]) => <a key={href} href={href} className={pathname === href ? styles.active : ''} aria-current={pathname === href ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className={styles.userSection}>
          <button className={styles.avatar} onClick={handleMyPage}>관</button>
          <button className={styles.userName} onClick={handleMyPage}>관리자님{/* <span>환영합니다</span> */}</button>
          <button type="button" className={styles.logout} onClick={handleLogout} aria-label="로그아웃"><Icon name="logout" size={15} /><span>로그아웃</span></button>
        </div>
        <button type="button" className={styles.mobileToggle} onClick={toggleMenu} aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation"><Icon name={isMobileMenuOpen ? 'close' : 'menu'} size={23} /></button>
        <nav id="mobile-navigation" className={styles.mobileNav} hidden={!isMobileMenuOpen} aria-label="모바일 메뉴">
          {links.map(([href, label]) => <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</a>)}
          <a href="/dashboard/mypage">마이페이지</a><a href="/logout">로그아웃</a>
        </nav>
      </header>
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
