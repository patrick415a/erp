'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/assets/layout/SideBar.module.scss';
import { Icon, type IconName } from './ui/Icon';
const sections: { title: string; links: { href: string; label: string; icon: IconName }[] }[] = [
  {
    title: 'ERP 업무',
    links: [
      { href: '/dashboard', label: '대시보드', icon: 'grid' },
      { href: '/dashboard/production', label: '생산관리', icon: 'production' },
      { href: '/dashboard/inventory', label: '재고관리', icon: 'box' },
      { href: '/dashboard/hr', label: '인사관리', icon: 'users' },
      { href: '/dashboard/settings', label: '기준정보', icon: 'settings' },
    ],
  },
  {
    title: '시스템 관리',
    links: [
      { href: '/dashboard/calendar', label: '일정관리', icon: 'calendar' },
      { href: '/users', label: '사용자 권한 관리', icon: 'users' },
      { href: '/settings', label: '시스템 환경설정', icon: 'settings' },
    ],
  },
];
export function SideBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.sidebar} aria-label="업무 메뉴">
      {sections.map((section) => (
        <section className={styles.section} key={section.title}>
          <h2>{section.title}</h2>
          <ul>
            {section.links.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={[styles.link, pathname === href ? styles.active : ''].join(' ')}
                  aria-current={pathname === href ? 'page' : undefined}
                >
                  <Icon name={icon} size={19} />
                  <span>{label}</span>
                  {pathname === href && <span className={styles.activeDot} />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {/* <div className={styles.bottom}><span className={styles.statusDot} /><span>Smart ERP<span className={styles.subtext}>전사적 자원 관리 시스템</span></span></div> */}
    </nav>
  );
}
