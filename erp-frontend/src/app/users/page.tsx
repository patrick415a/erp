'use client';

import axios from 'axios';
import { erpClient } from '@/app/api/erpClient';
import { roles, type MemberRole } from '@/app/api/access';
import { useAccess } from '@/store/access';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import dataView from '@/assets/common/DataView.module.scss';
import styles from '@/assets/dashboard/users/Users.module.scss';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { StatusSearch } from '@/components/ui/StatusSearch';
import type { RootState } from '@/store/store';

interface RoleNotice {
  message: string;
  status: 'success' | 'error';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: MemberRole | null;
  assignableRoles: MemberRole[];
}

const usersUrl = '/api/admin/users';
const usersPerPage = 10;

function getErrorMessage(error: unknown, fallback: string) {
  const response = axios.isAxiosError<{ detail?: string }>(error) ? error.response : undefined;
  const status = response?.status;
  if (status === 401) return '로그인 후 다시 시도해 주세요.';
  if (status === 403) return response?.data?.detail ?? '이 작업을 수행할 권한이 없습니다.';
  if (status === 404) return '사용자를 찾을 수 없습니다. 사용자 권한관리 화면을 다시 열어 주세요.';
  return fallback;
}

export default function UsersPage() {
  const { can } = useAccess();
  const canUpdate = can('USERS_UPDATE');
  const currentUserEmail = useSelector((state: RootState) => state.auth.userInfo?.email);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pendingChange, setPendingChange] = useState<{ userId: number; role: MemberRole } | null>(null);
  const [notice, setNotice] = useState<RoleNotice | null>(null);
  const [{ keyword, status }, setSearch] = useState({ keyword: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = users.filter((user) =>
    (!status || user.role === status) &&
    (user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword))
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);
  const hasSearch = Boolean(keyword || status);
  const emptyMessage = hasSearch ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.';
  const listMessage = isLoading
    ? '사용자 목록을 불러오는 중입니다.'
    : loadError || (filteredUsers.length === 0 ? emptyMessage : '');

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    erpClient.get<User[]>(usersUrl, { signal })
      .then(({ data }) => {
        if (signal.aborted) return;
        setUsers(data);
      })
      .catch((error) => {
        if (signal.aborted) return;
        const message = getErrorMessage(error, '사용자 목록을 불러오지 못했습니다.');
        setLoadError(message);
        setNotice({ message, status: 'error' });
      })
      .finally(() => {
        if (!signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [canUpdate]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => {
      setNotice((current) => current === notice ? null : current);
    }, notice.status === 'success' ? 3000 : 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function changeRole(user: User, role: MemberRole) {
    if (!canUpdate || pendingChange || role === user.role || !user.assignableRoles.includes(role)) return;
    setPendingChange({ userId: user.id, role });

    try {
      await erpClient.put(`${usersUrl}/${user.id}/role`, { role });
      setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, role } : entry));
      setNotice({ message: `${user.name}님의 권한을 변경했습니다.`, status: 'success' });
    } catch (error) {
      setNotice({
        message: getErrorMessage(error, '사용자 권한을 변경하지 못했습니다. 다시 시도해 주세요.'),
        status: 'error',
      });
    } finally {
      setPendingChange(null);
    }
  }

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>사용자 권한관리</h1>
          <p>ERP 사용자 목록과 권한을 관리합니다.</p>
        </div>
      </header>

      <div className={dataView.statsGrid} aria-busy={isLoading}>
        {Object.entries(roles).map(([role, { label, tone, icon }]) => (
          <section key={role} className={dataView.statCard} data-tone={tone}>
            <span className={dataView.statLabel}>{label}</span>
            <strong className={dataView.statValue}>
              {isLoading || loadError ? '—' : `${users.filter((user) => user.role === role).length.toLocaleString()}명`}
            </strong>
            <span className={dataView.statDecoration}>
              <Icon name={icon} size={19} />
            </span>
          </section>
        ))}
      </div>

      <section className={dataView.panel} aria-busy={isLoading || pendingChange !== null}>
        <header className={dataView.panelHeader}>
          <div>
            <h2>사용자 목록</h2>
            {hasSearch && !isLoading && !loadError && (
              <p className={styles.muted}>검색 결과 {filteredUsers.length}명</p>
            )}
          </div>
          <StatusSearch
            keywordLabel="이름 또는 이메일 검색"
            statusLabel="현재 권한"
            statuses={roles}
            onSearch={(keyword, status) => {
              setSearch({ keyword, status });
              setCurrentPage(1);
            }}
          />
        </header>
        <div className={dataView.tableScroller}>
          <table className={dataView.table}>
            <thead>
              <tr>
                <th scope="col">회원 ID</th>
                <th scope="col">이름</th>
                <th scope="col">이메일</th>
                <th scope="col">현재 권한</th>
                {canUpdate && <th scope="col">권한 변경</th>}
              </tr>
            </thead>
            <tbody>
              {listMessage ? (
                <tr>
                  <td colSpan={canUpdate ? 5 : 4} className={dataView.tableMessage}><p role="status">{listMessage}</p></td>
                </tr>
              ) : visibleUsers.map((user) => {
                const currentRole = user.role && roles[user.role];
                const isCurrentUser = currentUserEmail === user.email;
                const isSaving = pendingChange?.userId === user.id;

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className={dataView.badge} data-tone={currentRole?.tone}>
                        {currentRole?.label ?? '미설정'}
                      </span>
                    </td>
                    {canUpdate && <td>
                      {isCurrentUser ? (
                        <span className={`${styles.muted} ${styles.ownAccount}`}>내 계정</span>
                      ) : !user.assignableRoles.some((role) => role !== user.role) ? (
                        <span className={`${styles.muted} ${styles.ownAccount}`}>—</span>
                      ) : (
                        <select
                          aria-label={`${user.name} 권한 변경`}
                          className={styles.roleSelect}
                          value={isSaving ? pendingChange.role : user.role ?? ''}
                          disabled={pendingChange !== null}
                          onChange={(event) => void changeRole(user, event.target.value as MemberRole)}
                        >
                          {!currentRole && <option value="" disabled>권한 선택</option>}
                          {user.assignableRoles.map((role) => (
                            <option key={role} value={role}>{roles[role].label}</option>
                          ))}
                        </select>
                      )}
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!listMessage && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} label="사용자 목록 페이지" />
        )}
      </section>

      <div role="status">
        {notice && (
          <button
            type="button"
            className={styles.toast}
            data-status={notice.status}
            aria-label={`${notice.message} 알림 닫기`}
            onClick={() => setNotice(null)}
          >
            <Icon name={notice.status === 'success' ? 'check' : 'warning'} size={18} />
            <span className={styles.toastMessage}>{notice.message}</span>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    </Layout>
  );
}
