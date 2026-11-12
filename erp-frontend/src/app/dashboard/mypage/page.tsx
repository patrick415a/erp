'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import contentStyles from '@/assets/common/Content.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

import { Layout } from '@/components/Layout';
import { useSchedules } from '@/components/calendar/scheduleStorage';
import AlertModal, { type AlertNotice } from '@/components/modal/AlertModal';
import modalStyles from '@/assets/modal/ModalParts.module.scss';
import settingsStyles from '@/assets/dashboard/settings/Settings.module.scss';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLogout } from '@/store/authSlice';

import view from '@/assets/dashboard/WorkPage.module.scss';

import Script from 'next/script';

import styles from '@/assets/dashboard/mypage/Mypage.module.scss';

const loginRequiredNotice: AlertNotice = { message: '로그인이 필요합니다.', status: 'error' };

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

async function requestMemberProfile(signal: AbortSignal) {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const { data } = await axios.get('http://127.0.0.1:8080/api/members/profile', {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return data;
}

export default function MyPageClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    position: '',
    tel: '',
    address: '',
    detailAddress: ''
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [accountNotice, setAccountNotice] = useState<(AlertNotice & { returnToLogin?: boolean }) | null>(null);
  const [tab, setTab] = useState<'account' | 'message' | 'schedule'>('account');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isSentModalOpen, setIsSentModalOpen] = useState(false);
  const schedules = useSchedules();
  const orderedSchedules = [...schedules].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.time ?? '24:00').localeCompare(b.time ?? '24:00'),
  );

  const showReloginNotice = useCallback((notice: AlertNotice = loginRequiredNotice) => {
    dispatch(setLogout());
    delete axios.defaults.headers.common['Authorization'];
    setAccountNotice({ ...notice, returnToLogin: true });
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();

    requestMemberProfile(controller.signal).then((profile) => {
      if (controller.signal.aborted) return;
      if (profile === null) {
        showReloginNotice();
        return;
      }

      setFormData({
        position: profile.position ?? '',
        tel: profile.tel ?? '',
        address: profile.address ?? '',
        detailAddress: profile.detailAddress ?? ''
      });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (isUnauthorized(error)) {
        showReloginNotice();
        return;
      }
      console.error('회원정보 조회 실패: ', error);
      alert('회원정보를 불러오지 못했습니다.');
    });

    return () => controller.abort();
  }, [showReloginNotice]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      showReloginNotice();
      return;
    }

    try {
      await axios.put('http://127.0.0.1:8080/api/members/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('회원정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      if (isUnauthorized(error)) {
        showReloginNotice();
        return;
      }
      console.error('회원정보 수정 실패: ', error);
      alert('회원정보 수정에 실패했습니다.');
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isChangingPassword || accountNotice) return;

    if (newPassword !== newPasswordRepeat) {
      setAccountNotice({ message: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.', status: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showReloginNotice();
      return;
    }

    setIsChangingPassword(true);
    try {
      await axios.post(
        'http://127.0.0.1:8080/api/members/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }, // JWT 토큰을 헤더에 담아 전송
      );
      setOldPassword('');
      setNewPassword('');
      setNewPasswordRepeat('');
      showReloginNotice({
        message: '비밀번호가 성공적으로 변경되었습니다.\n다시 로그인해주세요.',
        status: 'success',
      });
    } catch (error) {
      if (isUnauthorized(error)) {
        showReloginNotice();
        return;
      }
      const response = axios.isAxiosError(error) ? error.response?.data : undefined;
      setAccountNotice({
        message: typeof response === 'string' && response.trim() ? response : '비밀번호 변경에 실패했습니다.',
        status: 'error',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeAccountNotice = () => {
    if (accountNotice?.returnToLogin) router.replace('/');
    setAccountNotice(null);
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

          setFormData((prev) => ({
            ...prev,
            address: fullAddress
          }));
        },
      }).open();
    } else {
      alert('주소 검색을 열 수 없습니다. 잠시 후 다시 시도해 주세요.');
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
            <form onSubmit={handleUpdateProfile} className={view.accountForm}>
              <h3 className={styles.subTitle}>내 정보 수정</h3>
              <div className={styles.inputGroup}>
                <div className={contentStyles.fieldSpacing}>
                  <label className={formControlsStyles.label}>직급</label>
                  <input type="text" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className={formControlsStyles.input} />
                </div>
                <div className={contentStyles.fieldSpacing}>
                  <label className={formControlsStyles.label}>전화번호</label>
                  <input type="text" required value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} className={formControlsStyles.input} />
                </div>
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label className={formControlsStyles.label}>주소</label>
                <div className={styles.address}>
                  <input type="text" readOnly value={formData.address} className={formControlsStyles.input} />
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
                <input type="text" required value={formData.detailAddress} onChange={(e) => setFormData({...formData, detailAddress: e.target.value})} className={formControlsStyles.input} />
              </div>
              <div className={buttonStyles.buttonLeft}>
                <button type="submit" data-variant="primary" className={buttonStyles.button}>
                  내 정보 수정
                </button>
              </div>
            </form>
            <form onSubmit={handleChangePassword} className={view.accountForm} aria-busy={isChangingPassword}>
              <h3 className={styles.subTitle}>비밀번호 변경</h3>
              <div className={contentStyles.fieldSpacing}>
                <label htmlFor="current-password" className={formControlsStyles.label}>기존 비밀번호</label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label htmlFor="new-password" className={formControlsStyles.label}>새 비밀번호</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={contentStyles.fieldSpacing}>
                <label htmlFor="confirm-password" className={formControlsStyles.label}>새 비밀번호 확인</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordRepeat}
                  onChange={(e) => setNewPasswordRepeat(e.target.value)}
                  required
                  className={formControlsStyles.input}
                />
              </div>
              <div className={buttonStyles.buttonLeft}>
                <button type="submit" data-variant="primary" className={buttonStyles.button} disabled={isChangingPassword}>
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
                if (!message.trim()) {
                  setMessageError('쪽지 내용을 입력해 주세요.');
                  return;
                }
                setMessageError('');
                setIsSentModalOpen(true);
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
                    setMessageError('');
                  }}
                  required
                  maxLength={2000}
                />
              </div>
              <button className={buttonStyles.button} type="submit">
                전송
              </button>
              {messageError && <p role="status" style={{ marginTop: '16px' }}>{messageError}</p>}
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
      <AlertModal
        isOpen={isSentModalOpen}
        message="전송이 완료되었습니다."
        status="success"
        onClose={() => setIsSentModalOpen(false)}
      />
      {accountNotice && (
        <AlertModal
          isOpen
          message={accountNotice.message}
          status={accountNotice.status}
          onClose={closeAccountNotice}
        />
      )}
    </Layout>
  );
}
