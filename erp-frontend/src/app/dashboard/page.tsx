'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';

import { Layout } from '@/components/Layout';

export default function DashboardPage() {
  return (
    <>
      <Layout>
        <header className={dataViewStyles.pageHeader}>
          <div>
            <h1>대시보드</h1>
          </div>
        </header>
      </Layout>
    </>
  );
}
