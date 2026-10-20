'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import { Icon } from '@/components/ui/Icon';

import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import { useState } from 'react';
import view from '@/assets/dashboard/WorkPage.module.scss';

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
    {
      id: 'INV-1001',
      name: '알루미늄 프레임 A형',
      category: '원자재',
      stock: 1250,
      unitPrice: 15000,
      status: 'normal',
    },
    {
      id: 'INV-1002',
      name: '공업용 모터 250W',
      category: '부품',
      stock: 12,
      unitPrice: 85000,
      status: 'low',
    },
    {
      id: 'INV-1003',
      name: '제어용 메인보드 v2',
      category: '부품',
      stock: 0,
      unitPrice: 120000,
      status: 'out',
    },
    {
      id: 'INV-1004',
      name: '포장용 종이박스 (대)',
      category: '포장재',
      stock: 5000,
      unitPrice: 800,
      status: 'normal',
    },
    {
      id: 'INV-1005',
      name: '스틸 볼트 M8',
      category: '소모품',
      stock: 45,
      unitPrice: 150,
      status: 'low',
    },
  ]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return (
          <span data-tone="success" className={dataViewStyles.badge}>
            정상
          </span>
        );
      case 'low':
        return (
          <span data-tone="warning" className={dataViewStyles.badge}>
            재고부족
          </span>
        );
      case 'out':
        return (
          <span data-tone="danger" className={dataViewStyles.badge}>
            품절
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
              <h1>재고관리</h1>
              <p>품목별 재고 수량과 자산 현황을 확인합니다.</p>
            </div>
            <div className={dataViewStyles.pageActions}>
              <button className={buttonStyles.button}>신규 품목 등록</button>
            </div>
          </header>
          <div className={dataViewStyles.statsGrid}>
            <section className={dataViewStyles.statCard} data-tone="primary">
              <span className={dataViewStyles.statLabel}>총 등록 품목</span>
              <strong className={dataViewStyles.statValue}>{items.length + '개'}</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="boxes" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="danger">
              <span className={dataViewStyles.statLabel}>재고 부족 / 품절</span>
              <strong className={dataViewStyles.statValue}>
                {items.filter((item) => item.status !== 'normal').length + '건'}
              </strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="warning" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="success">
              <span className={dataViewStyles.statLabel}>총 재고 자산</span>
              <strong className={dataViewStyles.statValue}>
                {'₩ ' +
                  items
                    .reduce((acc, curr) => acc + curr.stock * curr.unitPrice, 0)
                    .toLocaleString()}
              </strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="wallet" size={19} />
              </span>
            </section>
          </div>
          <section className={dataViewStyles.panel}>
            <header className={dataViewStyles.panelHeader}>
              <h2>현재고 현황</h2>
              <div className={dataViewStyles.panelActions}>
                <div className={view.search}>
                  <input
                    className={formControlsStyles.input}
                    placeholder="품목명 또는 코드 검색..."
                    aria-label="품목명 또는 코드 검색"
                  />
                  <button className={buttonStyles.button} data-variant="outline" data-size="small">
                    검색
                  </button>
                </div>
              </div>
            </header>
            <div className={dataViewStyles.tableScroller}>
              <table className={dataViewStyles.table}>
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
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.id}</strong>
                      </td>
                      <td className={view.itemName}>{item.name}</td>
                      <td>{item.category}</td>
                      <td className={view.number}>
                        <strong>{item.stock.toLocaleString()}</strong>
                      </td>
                      <td className={view.number}>{item.unitPrice.toLocaleString()}</td>
                      <td className={view.center}>{renderStatusBadge(item.status)}</td>
                      <td>
                        <div className={view.rowActions}>
                          <button
                            data-variant="outline"
                            data-size="small"
                            className={buttonStyles.button}
                          >
                            수정
                          </button>
                          <button
                            data-variant="danger"
                            data-size="small"
                            className={buttonStyles.button}
                          >
                            삭제
                          </button>
                        </div>
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
