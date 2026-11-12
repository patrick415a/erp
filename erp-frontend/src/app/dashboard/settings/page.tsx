'use client';

import { useState, type FormEvent } from 'react';
import { Layout } from '@/components/Layout';
import ModalLayout from '@/components/modal/ModalLayout';
import styles from '@/assets/dashboard/settings/Settings.module.scss';
import dataView from '@/assets/common/DataView.module.scss';
import forms from '@/assets/common/FormControls.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import modal from '@/assets/modal/ModalParts.module.scss';
import { InventoryItems } from '@/components/inventory/InventoryItems';
import { CompanyInfoForm } from '@/components/settings/CompanyInfoForm';

const menus = [
  ['company', '회사 기본 정보'],
  ['items', '품목 마스터 관리'],
  ['users', '시스템 권한 설정'],
] as const;
const permissions = ['대시보드 조회', '생산 오더 편집', '재고 품목 편집', '인사 목록 조회'];
const roles = ['시스템 관리자', '생산 관리자', '일반 임직원'];
const descriptions = {
  company: '회사명, 사업자등록번호, 대표 이메일을 관리합니다.',
  items: '재고관리와 같은 품목을 조회하고 관리합니다.',
  users: '변경 사항은 페이지를 벗어나면 초기화됩니다.',
};

export default function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState<(typeof menus)[number][0]>('company');
  const [roleEditor, setRoleEditor] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    [roles[0]]: permissions,
    [roles[1]]: permissions.slice(0, 2),
    [roles[2]]: permissions.slice(0, 1),
  });
  const [notice, setNotice] = useState('');

  function savePermissions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleEditor) return;
    const selected = new FormData(event.currentTarget).getAll('permissions').map(String);
    setRolePermissions((current) => ({ ...current, [roleEditor]: selected }));
    setRoleEditor(null);
    setNotice('권한 선택을 이 화면에 반영했습니다.');
  }

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>기준정보 설정</h1>
          <p>{descriptions[activeMenu]}</p>
        </div>
      </header>
      <div className={styles.content}>
        <nav className={styles.sidebar + ' ' + dataView.panel} aria-label="기준정보 메뉴">
          <ul>
            {menus.map(([id, label]) => (
              <li key={id} className={activeMenu === id ? styles.active : undefined}>
                <button
                  type="button"
                  className={buttons.button}
                  data-variant="ghost"
                  data-size="small"
                  aria-pressed={activeMenu === id}
                  onClick={() => {
                    setActiveMenu(id);
                    setNotice('');
                  }}
                >
                  {id === 'users' ? '권한 설정' : label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.mainPanel + ' ' + dataView.panel} data-list={activeMenu !== 'company' || undefined}>
          <h3>{menus.find(([id]) => id === activeMenu)?.[1]}</h3>
          <div hidden={activeMenu !== 'company'}>
            <CompanyInfoForm />
          </div>
          {activeMenu === 'items' && <InventoryItems variant="master" />}
          {activeMenu === 'users' && (
            <ul className={styles.roleList}>
              {roles.map((role) => (
                <li className={modal.scheduleItem} key={role}>
                  <div className={modal.scheduleHeader}>
                    <strong>{role}</strong>
                    <button
                      type="button"
                      className={buttons.button}
                      data-variant="outline"
                      data-size="small"
                      onClick={() => setRoleEditor(role)}
                    >
                      권한 설정
                    </button>
                  </div>
                  <p>{rolePermissions[role].join(' · ') || '선택된 권한이 없습니다.'}</p>
                </li>
              ))}
            </ul>
          )}
          {notice && <p role="status">{notice}</p>}
        </section>
      </div>
      {roleEditor && (
        <ModalLayout isOpen onClose={() => setRoleEditor(null)} title={roleEditor + ' 권한 설정'}>
          <form className={modal.formGroup} onSubmit={savePermissions}>
            {permissions.map((permission) => (
              <label key={permission} className={forms.checkboxLabel}>
                <input
                  type="checkbox"
                  name="permissions"
                  value={permission}
                  defaultChecked={rolePermissions[roleEditor].includes(permission)}
                />
                {permission}
              </label>
            ))}
            <button type="submit" className={styles.saveBtn}>
              권한 선택 반영
            </button>
          </form>
        </ModalLayout>
      )}
    </Layout>
  );
}
