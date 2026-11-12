'use client';

import { useId, useState, type FormEvent } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import AlertModal from '@/components/modal/AlertModal';
import buttonStyles from '@/assets/common/Button.module.scss';
import formStyles from '@/assets/common/FormControls.module.scss';
import styles from '@/assets/dashboard/settings/Settings.module.scss';

interface EmailMessageFormProps {
  subjectLabel: string;
  messageLabel: string;
  fixedSubject?: string;
  submitClassName?: string;
}

export function EmailMessageForm({
  subjectLabel,
  messageLabel,
  fixedSubject,
  submitClassName = buttonStyles.button,
}: EmailMessageFormProps) {
  const id = useId();
  const sender = useSelector((state: RootState) => state.auth.userInfo);
  const isLoadingSender = useSelector((state: RootState) => state.auth.userInfoRequestId !== null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isSentModalOpen, setIsSentModalOpen] = useState(false);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending || isSentModalOpen || isLoadingSender) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    const subject = fixedSubject ?? String(fields.get('subject') ?? '').trim();
    const message = String(fields.get('message') ?? '').trim();

    if (!subject || !message) {
      setError(fixedSubject ? '쪽지 내용을 입력해 주세요.' : '제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      setError('메일 전송 설정이 준비되지 않았습니다.');
      return;
    }

    const senderName = `${sender?.lastName ?? ''}${sender?.firstName ?? ''}`.trim();
    const senderEmail = sender?.email?.trim();
    const senderLines = [];
    if (senderName) senderLines.push(`발신자 이름: ${senderName}`);
    if (senderEmail) senderLines.push(`발신자 이메일: ${senderEmail}`);
    const body = senderLines.length ? `${senderLines.join('\n')}\n\n${message}` : message;

    setError('');
    setIsSending(true);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: accessKey, subject, message: body }),
      });
      if (!response.ok || (await response.json()).success !== true) {
        throw new Error('Web3Forms submission failed');
      }

      form.reset();
      setIsSentModalOpen(true);
    } catch {
      setError('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <form method="post" onSubmit={sendMessage} onChange={() => setError('')} aria-busy={isSending}>
        <div className={styles.formGroup}>
          <label htmlFor={id + '-subject'}>{subjectLabel}</label>
          <input
            id={id + '-subject'}
            name="subject"
            defaultValue={fixedSubject}
            readOnly={fixedSubject !== undefined || isSending}
            required
            maxLength={100}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={id + '-message'}>{messageLabel}</label>
          <textarea
            id={id + '-message'}
            name="message"
            className={formStyles.textarea}
            readOnly={isSending}
            required
            maxLength={2000}
          />
        </div>
        <button type="submit" className={submitClassName} disabled={isSending || isLoadingSender}>
          {isSending ? '전송 중…' : isLoadingSender ? '사용자 정보 확인 중…' : '전송'}
        </button>
        {error && <p className={styles.formError} role="alert">{error}</p>}
      </form>
      <AlertModal
        isOpen={isSentModalOpen}
        message="전송이 완료되었습니다."
        status="success"
        onClose={() => setIsSentModalOpen(false)}
      />
    </>
  );
}
