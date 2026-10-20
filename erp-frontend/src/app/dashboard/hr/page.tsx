"use client";

import { Layout } from '@/components/Layout';
import AlertModal from "@/components/modal/AlertModal";
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DataPanel, DataTable, PageHeader, StatCard, StatsGrid, StatusBadge } from '@/components/ui/DataView';
import view from '@/styles/WorkPage.module.scss';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: "active" | "leave" | "resigned";
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
    { id: "EMP-001", name: "김철수", department: "개발팀", role: "수석 엔지니어", status: "active", joinDate: "2020-03-02" },
    { id: "EMP-002", name: "이영희", department: "인사팀", role: "팀장", status: "active", joinDate: "2019-11-15" },
    { id: "EMP-003", name: "박민수", department: "영업팀", role: "사원", status: "leave", joinDate: "2022-07-01" },
    { id: "EMP-004", name: "정지원", department: "디자인팀", role: "UI/UX 디자이너", status: "active", joinDate: "2021-05-20" },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <StatusBadge tone="success">재직중</StatusBadge>;
      case "leave":
        return <StatusBadge tone="warning">휴직</StatusBadge>;
      case "resigned":
        return <StatusBadge tone="danger">퇴사</StatusBadge>;
      default:
        return <StatusBadge tone="secondary">알수없음</StatusBadge>;
    }
  };

  return (
    <>
      <Layout>
        <div className={view.page}>
          <PageHeader title="인사 관리" description="임직원 정보와 재직 현황을 한눈에 확인합니다."><Button>신규 직원 등록</Button></PageHeader>
          <StatsGrid>
            <StatCard label="총 임직원 수" value={employees.length + '명'} icon="users" />
            <StatCard label="이번 달 신규 입사" value="0명" tone="primary" icon="check" />
            <StatCard label="현재 휴직자" value={employees.filter(emp => emp.status === 'leave').length + '명'} tone="warning" icon="calendar" />
          </StatsGrid>
          <DataPanel title="임직원 목록">
            <DataTable>
              <thead>
                <tr>
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급/직책</th>
                  <th className={view.center}>상태</th>
                  <th>입사일</th><th className={view.center}>관리</th>
                </tr>
              </thead>
              <tbody>{employees.map(emp => <tr key={emp.id}>
                <td>{emp.id}</td><td><strong>{emp.name}</strong></td><td>{emp.department}</td><td>{emp.role}</td>
                <td className={view.center}>{getStatusBadge(emp.status)}</td><td>{emp.joinDate}</td>
                <td className={view.center}><Button variant="ghost" size="small">수정</Button></td>
              </tr>)}</tbody>
            </DataTable>
          </DataPanel>
        </div>
      </Layout>
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
