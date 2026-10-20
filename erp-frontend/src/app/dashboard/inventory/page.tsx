"use client";

import { Layout } from '@/components/Layout';
import AlertModal from "@/components/modal/AlertModal";
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DataPanel, DataTable, PageHeader, StatCard, StatsGrid, StatusBadge } from '@/components/ui/DataView';
import { Input } from '@/components/ui/FormControls';
import view from '@/styles/WorkPage.module.scss';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
  status: 'normal' | 'low' | 'out';
}

export default function InventoryPage() {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [items, setItems] = useState<InventoryItem[]>([
    { id: "INV-1001", name: "알루미늄 프레임 A형", category: "원자재", stock: 1250, unitPrice: 15000, status: "normal" },
    { id: "INV-1002", name: "공업용 모터 250W", category: "부품", stock: 12, unitPrice: 85000, status: "low" },
    { id: "INV-1003", name: "제어용 메인보드 v2", category: "부품", stock: 0, unitPrice: 120000, status: "out" },
    { id: "INV-1004", name: "포장용 종이박스 (대)", category: "포장재", stock: 5000, unitPrice: 800, status: "normal" },
    { id: "INV-1005", name: "스틸 볼트 M8", category: "소모품", stock: 45, unitPrice: 150, status: "low" },
  ]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <StatusBadge tone='success'>정상</StatusBadge>;
      case 'low':
        return <StatusBadge tone='warning'>재고부족</StatusBadge>;
      case 'out':
        return <StatusBadge tone='danger'>품절</StatusBadge>;
      default:
        return <StatusBadge tone='secondary'>알수없음</StatusBadge>;
    }
  };

  return (
    <>
      <Layout><div className={view.page}>
        <PageHeader title="재고관리" description="품목별 재고 수량과 자산 현황을 확인합니다."><Button>신규 품목 등록</Button></PageHeader>
        <StatsGrid>
          <StatCard label="총 등록 품목" value={items.length + '개'} tone="primary" icon="boxes" />
          <StatCard label="재고 부족 / 품절" value={items.filter(item => item.status !== 'normal').length + '건'} tone="danger" icon="warning" />
          <StatCard label="총 재고 자산" value={'₩ ' + items.reduce((acc, curr) => acc + (curr.stock * curr.unitPrice), 0).toLocaleString()} tone="success" icon="wallet" />
        </StatsGrid>
        <DataPanel title="현재고 현황" actions={<div className={view.search}><Input placeholder="품목명 또는 코드 검색..." aria-label="품목명 또는 코드 검색" /><Button variant="outline" size="small">검색</Button></div>}>
          <DataTable>
            <thead>
              <tr>
                <th>품목 코드</th>
                <th>품목명</th>
                <th>분류</th>
                <th className={view.number}>현재고</th>
                <th className={view.number}>단가 (원)</th>
                <th className={view.center}>상태</th>
                <th className={view.center}>관리</th>
              </tr>
            </thead>
            <tbody>{items.map(item => <tr key={item.id}>
              <td><strong>{item.id}</strong></td><td className={view.itemName}>{item.name}</td><td>{item.category}</td>
              <td className={view.number}><strong>{item.stock.toLocaleString()}</strong></td><td className={view.number}>{item.unitPrice.toLocaleString()}</td>
              <td className={view.center}>{renderStatusBadge(item.status)}</td>
              <td><div className={view.rowActions}><Button variant="outline" size="small">수정</Button><Button variant="danger" size="small">삭제</Button></div></td>
            </tr>)}</tbody>
          </DataTable>
        </DataPanel>
      </div></Layout>
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
