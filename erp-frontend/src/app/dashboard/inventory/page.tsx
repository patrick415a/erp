'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import { Icon } from '@/components/ui/Icon';

import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
  // 알림 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 재고 데이터
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //신규 품목 등록창
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '부품',
    stock: 0,
    unitPrice: 0
  });

  // Spring Boot에서 재고 목록 조회
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get<InventoryItem[]> ('http://localhost:8080/api/inventory/items');
      setItems(response.data);
    } catch (error) {
      console.error('재고 목록 조회 실패:', error);
      setModalMessage('재고 목록을 불러오지 못했습니다.');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  
  // 신규 품목 등록
  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      setModalMessage('품목명을 입력해주세요.');
      setIsModalOpen(true);
      return;
    }

    if (
      !Number.isFinite(newItem.stock) ||
      !Number.isFinite(newItem.unitPrice) ||
      newItem.stock < 0 ||
      newItem.unitPrice < 0
    ) {
      setModalMessage('재고 수량과 단가를 확인해주세요.');
      setIsModalOpen(true);
      return;
    }

    const itemData = {
      name: newItem.name.trim(),
      category: newItem.category,
      stock: newItem.stock,
      unitPrice: newItem.unitPrice,
      status: newItem.stock === 0 ? 'out' : newItem.stock <= 20 ? 'low' : 'normal'
    };

    try {
      setIsSaving(true);

      await axios.post('http://localhost:8080/api/inventory/items', itemData);
      await fetchInventoryItems();

      setIsAddModalOpen(false);

      setNewItem({
        name: '',
        category: '부품',
        stock: 0,
        unitPrice: 0,
      });

      setModalMessage('신규 품목이 등록되었습니다.');
      setIsModalOpen(true);
    } catch (error) {
      console.error('품목 등록 실패:', error);
      setModalMessage('품목 등록에 실패했습니다.');
      setIsModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

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
              <button className={buttonStyles.button} onClick={() => setIsAddModalOpen(true)}>
                신규 품목 등록
              </button>
            </div>
          </header>

          <div className={dataViewStyles.statsGrid}>
            <section className={dataViewStyles.statCard} data-tone="primary">
              <span className={dataViewStyles.statLabel}>총 등록 품목</span>
              <strong className={dataViewStyles.statValue}>
                {items.length + '개'}
              </strong>
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
                  <button
                    className={buttonStyles.button}
                    data-variant="outline"
                    data-size="small"
                  >
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        재고 목록을 불러오는 중입니다...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        등록된 재고가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.id}</strong>
                        </td>
                        <td className={view.itemName}>{item.name}</td>
                        <td>{item.category}</td>
                        <td className={view.number}>
                          <strong>{item.stock.toLocaleString()}</strong>
                        </td>
                        <td className={view.number}>
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className={view.center}>
                          {renderStatusBadge(item.status)}
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Layout>

      
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-inventory-title"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '28px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          }}>
            <h2 id="add-inventory-title"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '24px',
            }}>
              신규 품목 등록
            </h2>

            <div style={{ display: 'grid', gap: '18px' }}>
              <div>
                <label htmlFor="inventory-name">품목명</label>
                <input id="inventory-name" className={formControlsStyles.input}
                style={{ width: '100%', marginTop: '8px', boxSizing: 'border-box'}}
                placeholder="품목명을 입력하세요" value={newItem.name}
                onChange={(e) => setNewItem({
                  ...newItem,
                  name: e.target.value,
                })}/>
              </div>

              <div>
                <label htmlFor="inventory-category">분류</label>
                <select id="inventory-category" className={formControlsStyles.input}
                style={{ width: '100%', marginTop: '8px', boxSizing: 'border-box'}}
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    category: e.target.value,
                  })
                }>
                  <option value="원자재">원자재</option>
                  <option value="부품">부품</option>
                  <option value="포장재">포장재</option>
                  <option value="소모품">소모품</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <label htmlFor="inventory-stock">현재고</label>
                  <input id="inventory-stock" type="number" min="0" step="1" className={formControlsStyles.input}
                  style={{ width: '100%', marginTop: '8px', boxSizing: 'border-box'}} value={newItem.stock}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    stock: Number(e.target.value),
                  })}/>
                </div>

                <div>
                  <label htmlFor="inventory-price">단가 (원)</label>
                  <input id="inventory-price" type="number" min="0" step="1" className={formControlsStyles.input}
                  style={{ width: '100%', marginTop: '8px', boxSizing: 'border-box'}} value={newItem.unitPrice}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    unitPrice: Number(e.target.value),
                  })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '28px' }}>
              <button type="button" className={buttonStyles.button} data-variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}>
                취소
              </button>

              <button type="button" className={buttonStyles.button} onClick={handleAddItem} disabled={isSaving}>
                {isSaving ? '등록 중...' : '품목 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal}/>
    </>
  );
}
