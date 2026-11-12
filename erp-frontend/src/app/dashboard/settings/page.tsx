'use client';

import { useState, type FormEvent } from 'react';
import { Layout } from '@/components/Layout';
import ModalLayout from '@/components/modal/ModalLayout';
import styles from '@/assets/dashboard/settings/Settings.module.scss';
import dataView from '@/assets/common/DataView.module.scss';
import forms from '@/assets/common/FormControls.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import modal from '@/assets/modal/ModalParts.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';

interface Item {
  code: string;
  name: string;
  category: string;
  price: number;
}

const menus = [
  ['company', '회사 기본 정보'],
  ['items', '품목 마스터 관리'],
  ['users', '시스템 권한 설정'],
] as const;
const categories = ['원자재', '부품', '포장재', '소모품'];
const permissions = ['대시보드 조회', '생산 오더 편집', '재고 품목 편집', '인사 목록 조회'];
const roles = ['시스템 관리자', '생산 관리자', '일반 임직원'];
const initialItems: Item[] = [
  { code: 'MAT-001', name: '알루미늄 합금', category: '원자재', price: 8500 },
  { code: 'PRT-001', name: '공업용 모터', category: '부품', price: 125000 },
];

export default function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState<(typeof menus)[number][0]>('company');
  const [company, setCompany] = useState({
    name: 'Apple ERP Korea',
    registration: '123-45-67890',
    email: 'admin@apple-erp.co.kr',
  });
  const [items, setItems] = useState(initialItems);
  const [itemEditor, setItemEditor] = useState<{ item?: Item } | null>(null);
  const [itemError, setItemError] = useState('');
  const [roleEditor, setRoleEditor] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    [roles[0]]: permissions,
    [roles[1]]: permissions.slice(0, 2),
    [roles[2]]: permissions.slice(0, 1),
  });
  const [notice, setNotice] = useState('');

  function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const registration = String(data.get('registration') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    if (!name || !registration || !email) {
      setNotice('회사명, 사업자 등록번호, 대표 이메일을 입력해 주세요.');
      return;
    }
    setCompany({ name, registration, email });
    setNotice('회사 정보를 이 화면에 반영했습니다.');
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const original = itemEditor?.item;
    const code =
      original?.code ??
      String(data.get('code') ?? '')
        .trim()
        .toUpperCase();
    const name = String(data.get('name') ?? '').trim();
    const category = String(data.get('category') ?? '');
    const price = Number(data.get('price'));
    if (
      !code ||
      !name ||
      !categories.includes(category) ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      setItemError('품목 코드, 품목명, 분류, 기준 단가를 확인해 주세요.');
      return;
    }
    if (!original && items.some((item) => item.code.toUpperCase() === code)) {
      setItemError('이미 등록된 품목 코드입니다.');
      return;
    }
    const item = { code, name, category, price };
    setItems((current) =>
      original
        ? current.map((row) => (row.code === original.code ? item : row))
        : [...current, item],
    );
    setItemEditor(null);
    setNotice(original ? '품목 변경을 이 화면에 반영했습니다.' : '품목을 이 화면에 등록했습니다.');
  }

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
          <p>변경 사항은 페이지를 벗어나면 초기화됩니다.</p>
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
          {activeMenu === 'company' && (
            <form onSubmit={saveCompany}>
              <div className={styles.formGroup}>
                <label htmlFor="company-name">회사명</label>
                <input id="company-name" name="name" defaultValue={company.name} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="company-registration">사업자 등록번호</label>
                <input
                  id="company-registration"
                  name="registration"
                  defaultValue={company.registration}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="company-email">대표 이메일</label>
                <input
                  id="company-email"
                  name="email"
                  type="email"
                  defaultValue={company.email}
                  required
                />
              </div>
              <button type="submit" className={styles.saveBtn}>
                변경사항 반영
              </button>
            </form>
          )}
          {activeMenu === 'items' && (
            <>
              <div className={styles.formGroup}>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={() => {
                    setItemError('');
                    setItemEditor({});
                  }}
                >
                  신규 품목 등록
                </button>
              </div>
              <div className={dataView.tableScroller + ' ' + styles.itemTable}>
                <table className={dataView.table}>
                  <thead>
                    <tr>
                      <th>품목 코드</th>
                      <th>품목명</th>
                      <th>분류</th>
                      <th className={view.number}>기준 단가</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.code}>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td className={view.number}>{item.price.toLocaleString()}원</td>
                        <td>
                          <button
                            type="button"
                            className={buttons.button}
                            data-variant="outline"
                            data-size="small"
                            onClick={() => {
                              setItemError('');
                              setItemEditor({ item });
                            }}
                          >
                            수정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
      {itemEditor && (
        <ModalLayout
          isOpen
          onClose={() => setItemEditor(null)}
          title={itemEditor.item ? '품목 마스터 수정' : '신규 품목 마스터 등록'}
        >
          <form onSubmit={saveItem}>
            <div className={styles.formGroup}>
              <label htmlFor="master-code">품목 코드</label>
              <input
                id="master-code"
                name="code"
                defaultValue={itemEditor.item?.code}
                readOnly={Boolean(itemEditor.item)}
                required
                maxLength={20}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="master-name">품목명</label>
              <input
                id="master-name"
                name="name"
                defaultValue={itemEditor.item?.name}
                required
                maxLength={100}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="master-category">분류</label>
              <select
                id="master-category"
                name="category"
                className={forms.input}
                defaultValue={itemEditor.item?.category}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="master-price">기준 단가 (원)</label>
              <input
                id="master-price"
                name="price"
                type="number"
                defaultValue={itemEditor.item?.price}
                required
                min={0}
                step={1}
              />
            </div>
            {itemError && <p role="alert">{itemError}</p>}
            <button type="submit" className={styles.saveBtn}>
              {itemEditor.item ? '수정 반영' : '품목 등록'}
            </button>
          </form>
        </ModalLayout>
      )}
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
