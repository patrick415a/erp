'use client';

import { useEffect, useState } from 'react';
import { erpClient } from '@/app/api/erpClient';
import { Layout } from '@/components/Layout';
import dataView from '@/assets/common/DataView.module.scss';

export default function SystemSettingsPage() {
  const [timeZone, setTimeZone] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    erpClient.get<{ timeZone: string }>('/api/settings/system', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setTimeZone(data.timeZone);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>시스템 환경설정</h1>
          <p>서버 환경을 확인합니다.</p>
        </div>
      </header>
      <section className={dataView.statCard}>
        <span className={dataView.statLabel}>서버 시간대</span>
        <strong className={dataView.statValue} role="status">
          {loadError ? '환경 정보를 불러오지 못했습니다.' : timeZone ?? '불러오는 중…'}
        </strong>
      </section>
    </Layout>
  );
}
