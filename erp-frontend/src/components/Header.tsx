'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '@/store/authSlice';
import type { RootState } from '@/store/store';
import { Brand } from './Brand';
import styles from '@/assets/layout/Header.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import { Icon } from './ui/Icon';
import { ThemeToggle } from './ui/ThemeToggle';
import AlertModal from '@/components/modal/AlertModal';
import { firstAvailableMenu, menuPermissions } from '@/app/api/access';
import { useAccess } from '@/store/access';

const links = [
  ['/dashboard', '대시보드'],
  ['/dashboard/production', '생산관리'],
  ['/dashboard/inventory', '재고관리'],
  ['/dashboard/hr', '인사관리'],
  ['/dashboard/settings', '기준정보'],
];
const systemLinks = [
  ['/dashboard/calendar', '일정관리'],
  ['/users', '사용자 권한 관리'],
  ['/settings', '시스템 환경설정'],
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const userName = `${userInfo?.lastName ?? ''}${userInfo?.firstName ?? ''}`.trim();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { access, can } = useAccess();
  const visibleLinks = links.filter(([href]) => can(menuPermissions[href]));
  const mobileLinks = [...visibleLinks, ...systemLinks.filter(([href]) => can(menuPermissions[href]))];
  // 기존 로그아웃 처리: 토큰과 Axios 헤더를 지우고 로그인으로 이동합니다.

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(setLogout());
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
        <Brand compact href={access ? firstAvailableMenu(access) : '/dashboard'} />
        <nav className={styles.navigation} aria-label="주 메뉴">
          {visibleLinks.map(([href, label]) => (
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
            {userName ? userName.charAt(0) : ''}
          </button>

          <button className={styles.userName} onClick={handleMyPage}>
            {userName ? `${userName}님` : ''}
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
        <ThemeToggle className={styles.themeToggle} />
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
          {mobileLinks.map(([href, label]) => (
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
