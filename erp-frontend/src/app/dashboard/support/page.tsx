'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { EmailMessageForm } from '@/components/EmailMessageForm';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import styles from '@/assets/dashboard/settings/Settings.module.scss';

const questions = [
  [
    '로그인이 풀렸어요.',
    '로그아웃한 뒤 다시 로그인해 주세요. 비밀번호가 기억나지 않으면 로그인 화면에서 비밀번호 찾기를 이용할 수 있습니다.',
  ],
  [
    '재고가 최신 상태인지 어떻게 확인하나요?',
    '재고관리 화면을 새로고침하면 서버에서 목록을 다시 불러옵니다.',
  ],
  [
    '일정 알림음이 들리지 않아요.',
    '브라우저 탭의 음소거를 확인하고 ERP 화면을 한 번 클릭해 주세요.',
  ],
];

export default function SupportPage() {
  const [tab, setTab] = useState<'faq' | 'inquiry'>('faq');

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>기술지원</h1>
          <p>ERP 이용 중 궁금한 점을 확인합니다.</p>
        </div>
      </header>
      <div className={styles.content}>
        <nav className={styles.sidebar + ' ' + dataView.panel} aria-label="기술지원 메뉴">
          <ul>
            {(
              [
                ['faq', '자주 묻는 질문'],
                ['inquiry', '1:1 문의'],
              ] as const
            ).map(([id, label]) => (
              <li key={id} className={tab === id ? styles.active : undefined}>
                <button
                  type="button"
                  className={buttons.button}
                  data-variant="ghost"
                  aria-pressed={tab === id}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.mainPanel + ' ' + dataView.panel}>
          <h3>{tab === 'faq' ? '자주 묻는 질문' : '1:1 문의'}</h3>
          {tab === 'faq' && (
            questions.map(([question, answer]) => (
              <details className={styles.formGroup} key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))
          )}
          <div hidden={tab !== 'inquiry'}>
            <EmailMessageForm subjectLabel="문의 제목" messageLabel="문의 내용" submitClassName={styles.saveBtn} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
