'use client';

import { useState, type FormEvent } from 'react';
import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import dataView from '@/assets/common/DataView.module.scss';
import forms from '@/assets/common/FormControls.module.scss';
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
  const [inquiryError, setInquiryError] = useState('');
  const [isSentModalOpen, setIsSentModalOpen] = useState(false);

  function checkInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const complete = ['title', 'message'].every((field) => String(data.get(field) ?? '').trim());
    if (!complete) {
      setInquiryError('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setInquiryError('');
    setIsSentModalOpen(true);
  }

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
                  onClick={() => {
                    setTab(id);
                    setInquiryError('');
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.mainPanel + ' ' + dataView.panel}>
          <h3>{tab === 'faq' ? '자주 묻는 질문' : '1:1 문의'}</h3>
          {tab === 'faq' ? (
            questions.map(([question, answer]) => (
              <details className={styles.formGroup} key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))
          ) : (
            <form onSubmit={checkInquiry} onChange={() => setInquiryError('')}>
              <div className={styles.formGroup}>
                <label htmlFor="inquiry-title">문의 제목</label>
                <input id="inquiry-title" name="title" required maxLength={100} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="inquiry-message">문의 내용</label>
                <textarea
                  id="inquiry-message"
                  name="message"
                  className={forms.textarea}
                  required
                  maxLength={2000}
                />
              </div>
              <button type="submit" className={styles.saveBtn}>
                전송
              </button>
              {inquiryError && <p role="status" style={{ marginTop: '16px' }}>{inquiryError}</p>}
            </form>
          )}
        </section>
      </div>
      <AlertModal
        isOpen={isSentModalOpen}
        message="전송이 완료되었습니다."
        status="success"
        onClose={() => setIsSentModalOpen(false)}
      />
    </Layout>
  );
}
