"use client";

import { Layout } from '@/components/Layout';
import AlertModal from "@/components/modal/AlertModal";
import axios from 'axios';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DataPanel, DataTable, PageHeader, StatCard, StatsGrid, StatusBadge } from '@/components/ui/DataView';
import view from '@/styles/WorkPage.module.scss';

interface ProductionOrder {
  id: string;
  productName: string;
  quantity: number;
  status: 'planning' | 'progress' | 'completed';
  progress: number;
  dueDate: string;
}

export default function ProductionPage() {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /*
    { id: "PRD-2023-001", productName: "알루미늄 프레임 A형", quantity: 500, status: "progress", progress: 65, dueDate: "2023-11-20" },
    { id: "PRD-2023-002", productName: "공업용 모터 250W", quantity: 120, status: "planning", progress: 0, dueDate: "2023-11-25" },
    { id: "PRD-2023-003", productName: "제어용 메인보드 v2", quantity: 300, status: "completed", progress: 100, dueDate: "2023-11-15" },
    { id: "PRD-2023-004", productName: "스틸 하우징 케이스", quantity: 1000, status: "progress", progress: 30, dueDate: "2023-12-01" },
  */

  const [orders, setOrders] = useState<ProductionOrder[]>([]);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'progress':
        return { bg: 'primary', text: '생산중' };
      case 'completed':
        return { bg: 'success', text: '생산완료' };
      case 'planning':
      default:
        return { bg: 'secondary', text: '생산대기' };
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get('http://localhost:8080/api/production/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  const handleAddOrder = async () => {
    const newOrderData = {
      id: `PRD-2023-999`, // 테스트용 임시 ID
      productName: "테스트 신규 모터",
      quantity: 100,
      status: "planning",
      progress: 0,
      dueDate: "2023-12-31"
    };

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post('http://localhost:8080/api/production/orders', newOrderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": 'application/json'
        }
      });

      setOrders([...orders, res.data]);
      fetchProductionOrders();
      setModalMessage('생산 정보가 등록되었습니다');
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
      setModalMessage('생산 정보 등록에 실패하였습니다.\\n다시 시도해주세요');
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Layout><div className={view.page}>
        <PageHeader title="생산관리" description="생산 오더의 진행 상태와 납기 일정을 확인합니다."><Button onClick={handleAddOrder}>신규 오더 등록</Button></PageHeader>
        <StatsGrid>
          <StatCard label="진행중인 오더" value="2건" icon="production" />
          <StatCard label="생산 대기" value="1건" icon="calendar" />
          <StatCard label="이번 달 완료" value="1건" tone="success" icon="check" />
        </StatsGrid>
        <DataPanel title="생산 오더 목록">
          <DataTable>
            <thead>
              <tr>
                <th>오더 번호</th>
                <th>제품명</th>
                <th>수량</th>
                <th>상태</th>
                <th className={view.progressCell}>진행률</th>
                <th>납기일</th>
                <th className={view.center}>관리</th>
              </tr>
            </thead>
            <tbody>{orders.map(order => {
              const badge = getBadgeStyle(order.status);
              return <tr key={order.id}>
                <td><strong>{order.id}</strong></td><td>{order.productName}</td><td>{order.quantity.toLocaleString()} 개</td>
                <td><StatusBadge tone={badge.bg as 'primary' | 'success' | 'secondary'}>{badge.text}</StatusBadge></td>
                <td><div className={view.progress}><span>{order.progress}%</span><div className={view.progressTrack}>
                  <div className={view.progressFill} data-completed={order.status === 'completed' || undefined} role="progressbar" style={{ width: order.progress + '%' }} aria-valuenow={order.progress} aria-valuemin={0} aria-valuemax={100} />
                </div></div></td>
                <td>{order.dueDate}</td><td className={view.center}><Button variant="outline" size="small">상세보기</Button></td>
              </tr>;
            })}</tbody>
          </DataTable>
        </DataPanel>
      </div></Layout>
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
