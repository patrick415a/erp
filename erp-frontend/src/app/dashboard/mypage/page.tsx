'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import contentStyles from '@/assets/common/Content.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

import { Layout } from '@/components/Layout';
import { useSchedules } from '@/components/calendar/scheduleStorage';
import modalStyles from '@/assets/modal/ModalParts.module.scss';
import settingsStyles from '@/assets/dashboard/settings/Settings.module.scss';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import view from '@/assets/dashboard/WorkPage.module.scss';

import Script from 'next/script';

import styles from '@/assets/dashboard/mypage/Mypage.module.scss';

export default function MyPageClient() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [tab, setTab] = useState<'account' | 'message' | 'schedule'>('account');
  const [message, setMessage] = useState('');
  const [messageNotice, setMessageNotice] = useState('');
  const schedules = useSchedules();
  const orderedSchedules = [...schedules].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.time ?? '24:00').localeCompare(b.time ?? '24:00'),
  );

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }

    try {
      await axios.post(
        'http://127.0.0.1:8080/api/members/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }, // JWT 토큰을 헤더에 담아 전송
      );
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');

      // 보안을 위해 기존 토큰 파기 후 로그인 화면으로 이동
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      router.push('/');
    } catch (error: any) {
      alert(error.response?.data || '비밀번호 변경에 실패했습니다.');
    }
  };

  // 2. 다음 우편번호 검색 API 핸들러 완성
  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          // 도로명 주소의 노출 규칙에 따라 주소를 조합
          let fullAddress = data.address;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '')
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
          }

          // 주소 상태 업데이트
          // setFormData((prev) => ({
          //   ...prev,
          //   address: fullAddress,
          // }));
        },
      }).open();
    } else {
      alert('주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <Layout>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <div className={view.page}>
        <header className={dataViewStyles.pageHeader}>
          <div>
            <h1>마이페이지</h1>
            <p>계정 설정과 저장된 일정을 확인합니다.</p>
          </div>
        </header>
        <nav className={dataViewStyles.pageHeader} aria-label="마이페이지 메뉴">
          <div className={dataViewStyles.pageActions}>
            {(
              [
                ['account', '계정 설정'],
                ['message', '관리자 쪽지'],
                ['schedule', '내 일정'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={buttonStyles.button}
                data-size="small"
                data-variant={tab === id ? undefined : 'outline'}
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
        {tab === 'account' && (
          <div className={styles.content}>
            <form className={view.accountForm}>
              <h3 className={styles.subTitle}>내 정보 수정</h3>
              <div className={styles.inputGroup}>
                <div className={contentStyles.fieldSpacing}>
                  <label className={formControlsStyles.label}>직급</label>
                  <input type="text" required className={formControlsStyles.input} />
                </div>
                <div className={contentStyles.fieldSpacing}>
                  <label className={formControlsStyles.label}>전화번호</label>
                  <input type="text" required className={formControlsStyles.input} />
                </div>
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>주소</label>
                <div className={styles.address}>
                  <input type="text" readOnly className={formControlsStyles.input} />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    data-variant="outline"
                    className={buttonStyles.button}
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>상세주소</label>
                <input type="text" required className={formControlsStyles.input} />
              </div>
              <div className={buttonStyles.buttonLeft}>
                <button type="submit" data-variant="primary" className={buttonStyles.button}>
                  내 정보 수정
                </button>
              </div>
            </form>
            <form onSubmit={handleChangePassword} className={view.accountForm}>
              <h3 className={styles.subTitle}>비밀번호 변경</h3>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>기존 비밀번호</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>새 비밀번호 확인</label>
                <input
                  type="password"
                  value={newPasswordRepeat}
                  onChange={(e) => setNewPasswordRepeat(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={buttonStyles.buttonLeft}>
                <button type="submit" data-variant="primary" className={buttonStyles.button}>
                  비밀번호 변경하기
                </button>
              </div>
            </form>
          </div>
        )}
        {tab === 'message' && (
          <section className={settingsStyles.mainPanel}>
            <h3>관리자 쪽지</h3>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setMessageNotice(
                  message.trim()
                    ? '내용을 확인했습니다. 쪽지 전송은 아직 연결되지 않았습니다.'
                    : '쪽지 내용을 입력해 주세요.',
                );
              }}
            >
              <div className={settingsStyles.formGroup}>
                <label htmlFor="message-recipient">받는 사람</label>
                <input id="message-recipient" value="시스템 관리자" readOnly />
              </div>
              <div className={settingsStyles.formGroup}>
                <label htmlFor="admin-message">쪽지 내용</label>
                <textarea
                  id="admin-message"
                  className={formControlsStyles.textarea}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setMessageNotice('');
                  }}
                  required
                  maxLength={2000}
                />
              </div>
              <button className={buttonStyles.button} type="submit">
                쪽지 내용 확인
              </button>
              {messageNotice && <p role="status">{messageNotice}</p>}
            </form>
          </section>
        )}
        {tab === 'schedule' && (
          <section className={dataViewStyles.panel}>
            <header className={dataViewStyles.panelHeader}>
              <h2>이 브라우저에 저장된 일정</h2>
              <Link
                href="/dashboard/calendar"
                className={buttonStyles.button}
                data-variant="outline"
                data-size="small"
              >
                일정관리 열기
              </Link>
            </header>
            <div className={dataViewStyles.tableScroller}>
              <table className={dataViewStyles.table}>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>알림 시간</th>
                    <th>일정</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedSchedules.length ? (
                    orderedSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{schedule.date}</td>
                        <td>{schedule.time ?? '—'}</td>
                        <td>{schedule.title || schedule.content}</td>
                        <td>
                          <span className={modalStyles.badge} data-status={schedule.status}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={dataViewStyles.tableMessage}>
                        저장된 일정이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
