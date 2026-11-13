'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import formStyles from '@/assets/common/FormControls.module.scss';
import modalStyles from '@/assets/modal/ModalParts.module.scss';
import AlertModal from '@/components/modal/AlertModal';
import ModalLayout from '@/components/modal/ModalLayout';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { StatusSearch } from '@/components/ui/StatusSearch';
import { Temporal } from '@js-temporal/polyfill';
import { erpClient } from '@/app/api/erpClient';
import { useAccess } from '@/store/access';
import { Layout } from '@/components/Layout';
import { useEffect, useState, type FormEvent } from 'react';
import view from '@/assets/dashboard/WorkPage.module.scss';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'active' | 'leave' | 'resigned';
  joinDate: string;
}

type EmployeeDialog = { mode: 'create' } | { mode: 'edit' | 'delete'; employee: Employee };

const employeesUrl = '/api/hr/employees';
const employeeStatuses = {
  active: { label: '재직중', tone: 'success' },
  leave: { label: '휴직', tone: 'warning' },
  resigned: { label: '퇴사', tone: 'danger' },
};
const dialogActions = { create: '등록', edit: '수정', delete: '삭제' };
const dialogPermissions = { create: 'HR_CREATE', edit: 'HR_UPDATE', delete: 'HR_DELETE' } as const;
const employeeFields = [
  { name: 'name', label: '이름' },
  { name: 'department', label: '부서' },
  { name: 'role', label: '직급/직책' },
] as const;

export default function HrPage() {
  const { can } = useAccess();
  const canCreate = can('HR_CREATE');
  const canUpdate = can('HR_UPDATE');
  const canDelete = can('HR_DELETE');
  const showActions = canUpdate || canDelete;
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [{ keyword, status }, setSearch] = useState({ keyword: '', status: '' });

  const filteredEmployees = employees.filter((employee) =>
    (!status || employee.status === status) &&
    (employee.id.toLowerCase().includes(keyword) ||
      employee.name.toLowerCase().includes(keyword) ||
      employee.department.toLowerCase().includes(keyword))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEmployees = filteredEmployees.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dialog, setDialog] = useState<EmployeeDialog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [notice, setNotice] = useState('');
  const emptyMessage = keyword || status ? '검색 결과가 없습니다.' : '등록된 임직원이 없습니다.';
  const listMessage = isLoading
    ? '임직원 목록을 불러오는 중입니다.'
    : loadError && employees.length === 0
      ? '임직원 목록을 불러오지 못했습니다.'
      : filteredEmployees.length ? null : emptyMessage;

  useEffect(() => {
    const controller = new AbortController();

    erpClient.get<Employee[]>(employeesUrl, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setEmployees(data);
    }).catch((error) => {
      if (!controller.signal.aborted) {
        console.error('직원 목록 조회 실패:', error);
        setLoadError(true);
      }
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });

    return () => controller.abort();
  }, []);

  const openDialog = (nextDialog: EmployeeDialog) => {
    setDialogError('');
    setDialog(nextDialog);
  };

  const closeDialog = () => {
    if (!isSubmitting) setDialog(null);
  };

  const submitEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialog || isSubmitting || !can(dialogPermissions[dialog.mode])) return;

    const form = new FormData(event.currentTarget);
    const action = dialogActions[dialog.mode];
    setDialogError('');
    setIsSubmitting(true);

    try {
      if (dialog.mode === 'delete') {
        const { id } = dialog.employee;
        await erpClient.delete(`${employeesUrl}/${encodeURIComponent(id)}`);
        setEmployees((current) => current.filter((employee) => employee.id !== id));
      } else {
        const employee = {
          name: String(form.get('name') ?? '').trim(),
          department: String(form.get('department') ?? '').trim(),
          role: String(form.get('role') ?? '').trim(),
          status: String(form.get('status') ?? ''),
          joinDate: String(form.get('joinDate') ?? ''),
        };

        if (!employee.name || !employee.department || !employee.role) {
          setDialogError('이름, 부서, 직급/직책을 모두 입력해주세요.');
          return;
        }

        if (dialog.mode === 'edit') {
          const { id } = dialog.employee;
          const { data } = await erpClient.put<Employee>(`${employeesUrl}/${encodeURIComponent(id)}`, employee);
          setEmployees((current) => current.map((item) => (item.id === id ? data : item)));
        } else {
          const { data } = await erpClient.post<Employee>(employeesUrl, employee);
          setEmployees((current) => [...current, data]);
        }
      }

      setDialog(null);
      setNotice(`직원 정보가 ${action}되었습니다.`);
    } catch (error) {
      console.error(`직원 ${action} 실패:`, error);
      setDialogError(`직원 ${action}에 실패했습니다. 다시 시도해주세요.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = dialog?.mode === 'edit' ? dialog.employee : undefined;

  //이번 달 신규 입사자 수 계산
  const today = Temporal.Now.plainDateISO();

  const newEmployeesThisMonth = employees.filter((employee) => {
    const joinDate = Temporal.PlainDate.from(employee.joinDate);

    return (
      joinDate.year === today.year && joinDate.month === today.month
    );
  }).length;

  const getStatusBadge = (status: Employee['status']) => {
    const badge = employeeStatuses[status] ?? { label: '알수없음', tone: 'secondary' };
    return <span data-tone={badge.tone} className={dataViewStyles.badge}>{badge.label}</span>;
  };

  return (
    <>
    <Layout>
      <div className={view.page}>
        <header className={dataViewStyles.pageHeader}>
          <div>
            <h1>인사 관리</h1>
            <p>임직원 정보와 재직 현황을 한눈에 확인합니다.</p>
          </div>

          {canCreate && <div className={dataViewStyles.pageActions}>
            <button type="button" className={buttonStyles.button} onClick={() => openDialog({ mode: 'create' })}disabled={isLoading}>신규 직원 등록</button>
          </div>}
        </header>

        <div className={dataViewStyles.statsGrid}>
          <section className={dataViewStyles.statCard} data-tone="default">
            <span className={dataViewStyles.statLabel}>총 임직원 수</span>
            <strong className={dataViewStyles.statValue}>{employees.length + '명'}</strong>
            <span className={dataViewStyles.statDecoration}>
              <Icon name="users" size={19}/>
            </span>
          </section>

          <section className={dataViewStyles.statCard} data-tone="primary">
            <span className={dataViewStyles.statLabel}>이번 달 신규 입사</span>
            <strong className={dataViewStyles.statValue}>{newEmployeesThisMonth}명</strong>
            <span className={dataViewStyles.statDecoration}>
              <Icon name="check" size={19} />
            </span>
          </section>

          <section className={dataViewStyles.statCard} data-tone="warning">
            <span className={dataViewStyles.statLabel}>현재 휴직자</span>
            <strong className={dataViewStyles.statValue}>{employees.filter((emp) => emp.status === 'leave').length + '명'}</strong>
            <span className={dataViewStyles.statDecoration}>
              <Icon name="calendar" size={19}/>
            </span>
          </section>
        </div>

        <section className={dataViewStyles.panel}>
          <header className={dataViewStyles.panelHeader}>
            <h2>임직원 목록</h2>

            <StatusSearch
              keywordLabel="사번, 이름 또는 부서 검색"
              statusLabel="근무 상태"
              statuses={employeeStatuses}
              onSearch={(keyword, status) => {
                setSearch({ keyword, status });
                setCurrentPage(1);
              }}
            />
          </header>

          <div className={dataViewStyles.tableScroller}>
            <table className={dataViewStyles.table}>
              <thead>
                <tr>
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급/직책</th>
                  <th className={view.center}>상태</th>
                  <th>입사일</th>
                  {showActions && <th className={view.center}>관리</th>}
                </tr>
              </thead>

              <tbody>
                {listMessage ? (
                  <tr>
                    <td colSpan={showActions ? 7 : 6} className={dataViewStyles.tableMessage}>
                      <p role="status">{listMessage}</p>
                    </td>
                  </tr>
                ) : paginatedEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>
                      <strong>{emp.name}</strong>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.role}</td>
                    <td className={view.center}>{getStatusBadge(emp.status)}</td>
                    <td>{emp.joinDate}</td>
                    {showActions && <td className={view.center}>
                      <div className={view.rowActions}>
                        {canUpdate && <button type="button" data-variant="outline" data-size="small" className={buttonStyles.button} onClick={() => openDialog({ mode: 'edit', employee: emp })}>수정</button>}
                        {canDelete && <button type="button" data-variant="danger" data-size="small" className={buttonStyles.button} onClick={() => openDialog({ mode: 'delete', employee: emp })}>삭제</button>}
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!listMessage && (
            <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} label="임직원 목록 페이지" />
          )}
        </section>
      </div>
    </Layout>

    {dialog && can(dialogPermissions[dialog.mode]) && (
      <ModalLayout isOpen onClose={closeDialog} title={dialog.mode === 'create' ? '신규 직원 등록' : `직원 정보 ${dialogActions[dialog.mode]}`}>
        <form onSubmit={submitEmployee} aria-busy={isSubmitting}>
          {dialog.mode === 'delete' ? (
            <p className={modalStyles.text} data-align="left">
              {dialog.employee.name} ({dialog.employee.id}) 직원 정보를 삭제하시겠습니까?
            </p>
          ) : (
            <div className={modalStyles.formGroup}>
              {employeeFields.map(({ name, label }) => (
                <label key={name} className={formStyles.field}>
                  <span className={formStyles.label}>{label}</span>
                  <input name={name} className={formStyles.input} defaultValue={selectedEmployee?.[name]} maxLength={255} required disabled={isSubmitting}/>
                </label>
              ))}

              <div className={formStyles.field}>
                <label htmlFor="hr-employee-status" className={formStyles.label}>근무 상태</label>
                <select id="hr-employee-status" name="status" className={formStyles.input} defaultValue={selectedEmployee?.status ?? 'active'} disabled={isSubmitting}>
                  {Object.entries(employeeStatuses).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <label className={formStyles.field}>
                <span className={formStyles.label}>입사일</span>
                <input type="date" name="joinDate" className={formStyles.input} defaultValue={selectedEmployee?.joinDate ?? Temporal.Now.plainDateISO().toString()} required disabled={isSubmitting}/>
              </label>
            </div>
          )}
          
          {dialogError && <p role="alert">{dialogError}</p>}
          <div className={modalStyles.actions}>
            <button type="button" data-variant="outline" className={buttonStyles.button} onClick={closeDialog} disabled={isSubmitting}>취소</button>
            <button type="submit" data-variant={dialog.mode === 'delete' ? 'danger' : undefined} className={buttonStyles.button} disabled={isSubmitting}>{isSubmitting ? '처리 중…' : dialogActions[dialog.mode]}</button>
          </div>
        </form>
      </ModalLayout>
    )}
    {notice && <AlertModal isOpen message={notice} status="success" onClose={() => setNotice('')} />}
    </>
  );
}
