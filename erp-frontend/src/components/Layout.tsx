'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from '@/assets/layout/Layout.module.scss';
import { SideBar } from './SideBar';
import { Icon } from './ui/Icon';

const pageNames: Record<string, string> = {
  '/dashboard': '대시보드',
  '/dashboard/production': '생산관리',
  '/dashboard/inventory': '재고관리',
  '/dashboard/hr': '인사관리',
  '/dashboard/settings': '기준정보',
  '/dashboard/calendar': '일정관리',
  '/dashboard/mypage': '마이페이지',
};

// 공통 틀의 디자인만 담당합니다. 업무별 입력·조회 기능은 children에 그대로 있습니다.
export function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = pageNames[pathname] || 'ERP 업무';
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <SideBar />
        </aside>
        <div className={styles.mainColumn}>
          <main className={styles.content}>
            <nav className={styles.breadcrumb} aria-label="현재 위치">
              <Icon name="home" size={15} />
              <span>ERP 업무</span>
              <Icon name="chevron" size={12} />
              <span>{title}</span>
            </nav>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
