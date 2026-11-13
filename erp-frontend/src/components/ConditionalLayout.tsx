'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuPermissions } from '@/app/api/access';
import { useAccess } from '@/store/access';
import buttons from '@/assets/common/Button.module.scss';
import dataView from '@/assets/common/DataView.module.scss';
import { Layout } from './Layout';
import { ScheduleReminder } from './calendar/ScheduleReminder';
import AlertModal from './modal/AlertModal';
import { acknowledgeSessionExpiry } from '@/store/authSlice';
import { useSessionExpiry } from '@/store/useSessionExpiry';
import type { RootState } from '@/store/store';

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const sessionExpired = useSelector((state: RootState) => state.auth.sessionExpired);
  useSessionExpiry();
  const { can, status, refreshAccess } = useAccess();
  const permission = menuPermissions[pathname];

  if (sessionExpired) {
    return (
      <AlertModal
        isOpen
        message={'로그아웃되었습니다.\n다시 로그인해 주세요.'}
        onClose={() => {
          dispatch(acknowledgeSessionExpiry());
          router.replace('/');
        }}
      />
    );
  }

  if (permission && !can(permission)) {
    const message = {
      loading: '메뉴 권한을 확인하는 중입니다.',
      ready: '이 메뉴를 조회할 권한이 없습니다.',
      login: '메뉴를 이용하려면 로그인해 주세요.',
      error: '메뉴 권한을 불러오지 못했습니다.',
    }[status];

    return (
      <Layout>
        <header className={dataView.pageHeader}>
          <div>
            <h1>{status === 'ready' ? '접근 권한이 없습니다' : '메뉴 권한 확인'}</h1>
            <p role="status">{message}</p>
          </div>
        </header>
        {status === 'login' && <Link className={buttons.button} href="/">로그인</Link>}
        {status === 'error' && (
          <button type="button" className={buttons.button} onClick={refreshAccess}>다시 불러오기</button>
        )}
      </Layout>
    );
  }

  return (
    <>
      {children}
      <ScheduleReminder />
    </>
  );
}
