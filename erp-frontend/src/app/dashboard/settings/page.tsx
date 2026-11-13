'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import styles from '@/assets/dashboard/settings/Settings.module.scss';
import dataView from '@/assets/common/DataView.module.scss';
import { InventoryItems } from '@/components/inventory/InventoryItems';
import { CompanyInfoForm } from '@/components/settings/CompanyInfoForm';
import { RolePermissions } from '@/components/settings/RolePermissions';
import { useAccess } from '@/store/access';

const menus = [
  { id: 'company', label: '회사 기본 정보', title: '회사 기본 정보', description: '회사명, 사업자등록번호, 대표 이메일을 관리합니다.' },
  { id: 'items', label: '품목 마스터 관리', title: '품목 마스터 관리', description: '재고관리와 같은 품목을 조회하고 관리합니다.' },
  { id: 'permissions', label: '권한 설정', title: '시스템 권한 설정', description: '역할별로 사용할 수 있는 메뉴와 기능을 설정합니다.' },
] as const;

export default function SettingsPage() {
  const { access } = useAccess();
  const [selectedMenu, setSelectedMenu] = useState<(typeof menus)[number]['id']>('company');
  const visibleMenus = menus.filter(({ id }) => id !== 'permissions' || access?.role === 'SYSTEM_ADMIN');
  const activeMenu = visibleMenus.find(({ id }) => id === selectedMenu) ?? menus[0];

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>기준정보 설정</h1>
          <p>{activeMenu.description}</p>
        </div>
      </header>
      <div className={styles.content}>
        <nav className={styles.sidebar + ' ' + dataView.panel} aria-label="기준정보 메뉴">
          <ul>
            {visibleMenus.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  className={styles.menuButton}
                  aria-pressed={activeMenu.id === id}
                  onClick={() => setSelectedMenu(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.mainPanel + ' ' + dataView.panel} data-list={activeMenu.id !== 'company' || undefined}>
          <h3>{activeMenu.title}</h3>
          <div hidden={activeMenu.id !== 'company'}>
            <CompanyInfoForm />
          </div>
          {activeMenu.id === 'items' && <InventoryItems variant="master" />}
          {activeMenu.id === 'permissions' && <RolePermissions />}
        </section>
      </div>
    </Layout>
  );
}
