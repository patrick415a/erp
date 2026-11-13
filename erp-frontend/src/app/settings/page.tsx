'use client';

import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { erpClient } from '@/app/api/erpClient';
import { defaultLogo, logoUrl, type Appearance } from '@/app/api/appearance';
import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import { Icon } from '@/components/ui/Icon';
import { useAccess } from '@/store/access';
import { useAppearance } from '@/store/appearance';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import forms from '@/assets/common/FormControls.module.scss';
import layout from '@/assets/dashboard/settings/Settings.module.scss';
import styles from '@/assets/dashboard/settings/SystemSettings.module.scss';

const sections = [['brand', '시스템 정보 변경'], ['theme', '테마 변경']] as const;
const themes = [
  { value: 'LIGHT', label: '라이트 모드', icon: 'sun' },
  { value: 'DARK', label: '다크 모드', icon: 'moon' },
] as const;

export default function SystemSettingsPage() {
  const router = useRouter();
  const { can } = useAccess();
  const { appearance, applyAppearance } = useAppearance();
  const canUpdate = can('SYSTEM_SETTINGS_UPDATE');
  const [section, setSection] = useState<'brand' | 'theme'>('brand');
  const [name, setName] = useState(appearance.name);
  const [theme, setTheme] = useState(appearance.defaultTheme);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [resetLogo, setResetLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0];
    if (!selected) return;
    if (!['image/png', 'image/jpeg'].includes(selected.type) || selected.size > 1024 * 1024) {
      clearSelectedLogo();
      setFeedback({ text: '1MB 이하의 PNG 또는 JPG 이미지를 선택해 주세요.', error: true });
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResetLogo(false);
    setFeedback(null);
  }

  function clearSelectedLogo() {
    if (logoInput.current) logoInput.current.value = '';
    setFile(null);
    setPreview('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate || isSaving) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      let next: Appearance;
      if (section === 'brand') {
        const body = new FormData();
        body.set('name', name.trim());
        body.set('resetLogo', String(resetLogo));
        if (appearance.version !== null) body.set('version', String(appearance.version));
        if (file) body.set('logo', file);
        ({ data: next } = await erpClient.put<Appearance>('/api/settings/system/brand', body));
        setName(next.name);
        clearSelectedLogo();
        setResetLogo(false);
      } else {
        ({ data: next } = await erpClient.put<Appearance>('/api/settings/system/theme', { theme, version: appearance.version }));
      }
      applyAppearance(next);
      router.refresh();
      setFeedback({ text: section === 'brand' ? '시스템 정보를 저장했습니다.' : '기본 테마를 저장했습니다.' });
    } catch (error) {
      const response = axios.isAxiosError<{ detail?: string }>(error) ? error.response : undefined;
      setFeedback({
        text: response?.data?.detail ?? '시스템 환경설정을 저장하지 못했습니다. 다시 시도해 주세요.',
        error: true,
      });
      if (response?.status === 409) {
        try {
          const { data } = await erpClient.get<Appearance>('/api/system/appearance');
          applyAppearance(data);
        } catch {
          // Keep the draft available for another attempt.
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  const title = sections.find(([id]) => id === section)?.[1];
  const image = preview || (resetLogo ? defaultLogo : logoUrl(appearance));

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>시스템 환경설정</h1>
          <p>시스템 이름과 로고, 기본 테마를 관리합니다.</p>
        </div>
      </header>
      <div className={layout.content}>
        <nav className={layout.sidebar} aria-label="시스템 환경설정 메뉴">
          <ul>
            {sections.map(([id, label]) => (
              <li key={id}>
                <button type="button" className={layout.menuButton} aria-pressed={section === id} disabled={isSaving}
                  onClick={() => { setSection(id); setFeedback(null); }}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className={layout.mainPanel}>
          <h3>{title}</h3>
          <form className={styles.form} onSubmit={save} aria-busy={isSaving}>
            {section === 'brand' ? (
              <>
                <label className={forms.field}>
                  <span className={forms.label}>시스템명</span>
                  <input className={forms.input} value={name} onChange={(event) => setName(event.target.value)}
                    maxLength={50} required readOnly={!canUpdate || isSaving} />
                </label>
                <div className={forms.field}>
                  {canUpdate
                    ? <label className={forms.label} htmlFor="system-logo-file">로고 아이콘</label>
                    : <span className={forms.label}>로고 아이콘</span>}
                  <div className={styles.logoRow}>
                    <Image src={image} alt="시스템 로고 미리보기" width={60} height={60} className={styles.logo} unoptimized />
                    {canUpdate && <div className={forms.field}>
                      <input ref={logoInput} id="system-logo-file" type="file" accept="image/png,image/jpeg" aria-describedby="system-logo-help"
                        className={styles.file} onChange={selectLogo} disabled={isSaving} />
                      <p id="system-logo-help" className={styles.hint}>PNG 또는 JPG, 최대 1MB</p>
                    </div>}
                  </div>
                  {canUpdate && (appearance.hasLogo || file) && !resetLogo && (
                    <button type="button" className={`${buttons.button} ${styles.reset}`} data-variant="outline" data-size="small"
                      disabled={isSaving} onClick={() => { clearSelectedLogo(); setResetLogo(true); setFeedback(null); }}>
                      기본 로고 사용
                    </button>
                  )}
                </div>
              </>
            ) : (
              <fieldset className={styles.themeField} disabled={!canUpdate || isSaving}>
                <legend className={forms.label}>기본 테마</legend>
                <p className={styles.hint}>개인 테마를 선택하기 전에는 이 테마로 표시됩니다.</p>
                <div className={styles.themeChoices}>
                  {themes.map(({ value, label, icon }) => (
                    <label key={value} className={`${forms.radioLabel} ${styles.themeOption}`}>
                      <input type="radio" name="theme" value={value} checked={theme === value}
                        onChange={() => setTheme(value)} />
                      <span className={styles.themeSample} data-preview={value.toLowerCase()} aria-hidden="true">
                        <span /><span /><span />
                      </span>
                      <span className={styles.themeLabel}><Icon name={icon} size={16} />{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {canUpdate && <button type="submit" className={`${buttons.button} ${styles.save}`} disabled={isSaving}>
              {isSaving ? '저장 중…' : '변경사항 저장'}
            </button>}
            {feedback?.error && <p className={layout.formError} role="status">{feedback.text}</p>}
          </form>
        </section>
      </div>
      {feedback && !feedback.error && (
        <AlertModal isOpen status="success" message={feedback.text} onClose={() => setFeedback(null)} />
      )}
    </Layout>
  );
}
