'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { erpClient } from '@/app/api/erpClient';
import { useAccess } from '@/store/access';
import AlertModal from '@/components/modal/AlertModal';
import buttons from '@/assets/common/Button.module.scss';
import styles from '@/assets/dashboard/settings/Settings.module.scss';

interface CompanyInfo {
  name: string;
  registration: string;
  email: string;
}

interface SaveNotice {
  status: 'success' | 'error' | 'login';
  message: string;
}

const companyPath = '/api/settings/company';
const emptyCompany: CompanyInfo = { name: '', registration: '', email: '' };

async function requestCompanyInfo(signal: AbortSignal) {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const { data } = await erpClient.get<CompanyInfo>(companyPath, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return data;
}

export function CompanyInfoForm() {
  const { can } = useAccess();
  const canUpdate = can('SETTINGS_UPDATE');
  const [company, setCompany] = useState(emptyCompany);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error' | 'login'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<SaveNotice | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestCompanyInfo(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data === null) {
          setLoadStatus('login');
          return;
        }
        setCompany(data);
        setLoadStatus('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadStatus(axios.isAxiosError(error) && error.response?.status === 401 ? 'login' : 'error');
      });

    return () => controller.abort();
  }, [loadAttempt]);

  function updateField(field: keyof CompanyInfo, value: string) {
    setCompany((current) => ({ ...current, [field]: value }));
    setNotice(null);
  }

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdate || isSaving || notice?.status === 'success') return;

    const token = localStorage.getItem('token');
    if (!token) {
      setNotice({ status: 'login', message: '회사 정보를 저장하려면 로그인해 주세요.' });
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      const { data } = await erpClient.put<CompanyInfo>(companyPath, company, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompany(data);
      setNotice({ status: 'success', message: '회사 정보를 저장했습니다.' });
    } catch (error) {
      const response = axios.isAxiosError<{ detail?: string }>(error) ? error.response : undefined;
      if (response?.status === 401) {
        setNotice({ status: 'login', message: '회사 정보를 저장하려면 다시 로그인해 주세요.' });
      } else {
        setNotice({ status: 'error', message: response?.data?.detail || '회사 정보를 저장하지 못했습니다. 다시 시도해 주세요.' });
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (loadStatus === 'loading') return <p role="status">회사 정보를 불러오는 중입니다.</p>;

  if (loadStatus === 'login') {
    return (
      <>
        <p className={styles.formGroup} role="status">회사 정보를 확인하려면 로그인해 주세요.</p>
        <Link href="/" className={buttons.button} data-variant="outline">로그인 페이지</Link>
      </>
    );
  }

  if (loadStatus === 'error') {
    return (
      <>
        <p className={styles.formGroup} role="alert">회사 정보를 불러오지 못했습니다.</p>
        <button type="button" className={buttons.button} data-variant="outline" onClick={() => {
          setLoadStatus('loading');
          setLoadAttempt((attempt) => attempt + 1);
        }}>
          다시 불러오기
        </button>
      </>
    );
  }

  return (
    <form onSubmit={saveCompany} aria-busy={isSaving}>
      <div className={styles.formGroup}>
        <label htmlFor="company-name">회사명</label>
        <input
          id="company-name"
          name="name"
          value={company.name}
          onChange={(event) => updateField('name', event.target.value)}
          readOnly={!canUpdate || isSaving}
          required
          maxLength={100}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="company-registration">사업자등록번호</label>
        <input
          id="company-registration"
          name="registration"
          value={company.registration}
          onChange={(event) => updateField('registration', event.target.value)}
          inputMode="numeric"
          placeholder="000-00-00000"
          pattern="[0-9]{10}|[0-9]{3}-[0-9]{2}-[0-9]{5}"
          title="사업자등록번호 숫자 10자리"
          readOnly={!canUpdate || isSaving}
          required
          maxLength={12}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="company-email">대표 이메일</label>
        <input
          id="company-email"
          name="email"
          type="email"
          value={company.email}
          onChange={(event) => updateField('email', event.target.value)}
          readOnly={!canUpdate || isSaving}
          required
          maxLength={254}
        />
      </div>
      {canUpdate && <button type="submit" className={styles.saveBtn} disabled={isSaving}>
        {isSaving ? '저장 중…' : '변경사항 저장'}
      </button>}
      {notice?.status === 'success' ? (
        <AlertModal isOpen status="success" message={notice.message} onClose={() => setNotice(null)} />
      ) : notice && (
        <p className={styles.formError} role="status">
          {notice.message}
          {notice.status === 'login' && <> <Link href="/">로그인 페이지</Link></>}
        </p>
      )}
    </form>
  );
}
