'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Icon } from '@/components/ui/Icon';

import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import { useState } from 'react';
import view from '@/assets/dashboard/WorkPage.module.scss';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'active' | 'leave' | 'resigned';
  joinDate: string;
}

export default function HrPage() {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'EMP-001',
      name: '김철수',
      department: '개발팀',
      role: '수석 엔지니어',
      status: 'active',
      joinDate: '2020-03-02',
    },
    {
      id: 'EMP-002',
      name: '이영희',
      department: '인사팀',
      role: '팀장',
      status: 'active',
      joinDate: '2019-11-15',
    },
    {
      id: 'EMP-003',
      name: '박민수',
      department: '영업팀',
      role: '사원',
      status: 'leave',
      joinDate: '2022-07-01',
    },
    {
      id: 'EMP-004',
      name: '정지원',
      department: '디자인팀',
      role: 'UI/UX 디자이너',
      status: 'active',
      joinDate: '2021-05-20',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span data-tone="success" className={dataViewStyles.badge}>
            재직중
          </span>
        );
      case 'leave':
        return (
          <span data-tone="warning" className={dataViewStyles.badge}>
            휴직
          </span>
        );
      case 'resigned':
        return (
          <span data-tone="danger" className={dataViewStyles.badge}>
            퇴사
          </span>
        );
      default:
        return (
          <span data-tone="secondary" className={dataViewStyles.badge}>
            알수없음
          </span>
        );
    }
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
            <div className={dataViewStyles.pageActions}>
              <button className={buttonStyles.button}>신규 직원 등록</button>
            </div>
          </header>
          <div className={dataViewStyles.statsGrid}>
            <section className={dataViewStyles.statCard} data-tone="default">
              <span className={dataViewStyles.statLabel}>총 임직원 수</span>
              <strong className={dataViewStyles.statValue}>{employees.length + '명'}</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="users" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="primary">
              <span className={dataViewStyles.statLabel}>이번 달 신규 입사</span>
              <strong className={dataViewStyles.statValue}>0명</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="check" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="warning">
              <span className={dataViewStyles.statLabel}>현재 휴직자</span>
              <strong className={dataViewStyles.statValue}>
                {employees.filter((emp) => emp.status === 'leave').length + '명'}
              </strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="calendar" size={19} />
              </span>
            </section>
          </div>
          <section className={dataViewStyles.panel}>
            <header className={dataViewStyles.panelHeader}>
              <h2>임직원 목록</h2>
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
                    <th className={view.center}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.role}</td>
                      <td className={view.center}>{getStatusBadge(emp.status)}</td>
                      <td>{emp.joinDate}</td>
                      <td className={view.center}>
                        <button
                          data-variant="ghost"
                          data-size="small"
                          className={buttonStyles.button}
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Layout>
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
