'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Icon } from '@/components/ui/Icon';

import { Layout } from '@/components/Layout';
import AlertModal from '@/components/modal/AlertModal';
import axios from 'axios';
import { useEffect, useState } from 'react';
import view from '@/assets/dashboard/WorkPage.module.scss';

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
  const progressCount = orders.filter(
    (order) => order.status === 'progress'
  ).length;

  const planningCount = orders.filter(
    (order) => order.status === 'planning'
  ).length;

  const completedThisMonth = orders.filter((order) => {
    if (order.status !== 'completed') return false;

    const now = new Date();
    const dueDate = new Date(order.dueDate);

    return (
      dueDate.getFullYear() === now.getFullYear() && dueDate.getMonth() === now.getMonth()
    );
  }).length;

  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newOrder, setNewOrder] = useState({
    productName: '',
    quantity: 1,
    status: 'planning' as ProductionOrder['status'],
    progress: 0,
    dueDate: ''
  })

  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    border: '1px solid #d9e0ec',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxSizing: 'border-box',
  } as const;

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
        headers: { Authorization: `Bearer ${token}` },
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
    if (
      !newOrder.productName.trim() ||
      !Number.isInteger(newOrder.quantity) ||
      newOrder.quantity <= 0 ||
      !newOrder.dueDate
    ) {
      setModalMessage('제품명, 생산 수량, 납기일을 확인해주세요.');
      setIsModalOpen(true);
      return;
    }

    // 기존 데이터와 겹치지 않는 임시 오더 번호 생성
    const id = `PRD-${crypto.randomUUID()}`;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:8080/api/production/orders',
        {
          id,
          ...newOrder,
        },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchProductionOrders();

      setIsAddOpen(false);

      setNewOrder({
        productName: '',
        quantity: 1,
        status: 'planning',
        progress: 0,
        dueDate: '',
      });

      setModalMessage('생산 정보가 등록되었습니다.');
      setIsModalOpen(true);
    } catch (error) {
      console.error('생산 오더 등록 실패:', error);
      setModalMessage('생산 정보 등록에 실패했습니다.');
      setIsModalOpen(true);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    if (
      !selectedOrder.productName.trim() ||
      !Number.isInteger(selectedOrder.quantity) ||
      selectedOrder.quantity <= 0 ||
      !Number.isInteger(selectedOrder.progress) ||
      selectedOrder.progress < 0 ||
      selectedOrder.progress > 100 ||
      !selectedOrder.dueDate
    ) {
      setModalMessage('입력한 정보를 확인해주세요.');
      setIsModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(`http://localhost:8080/api/production/orders/${encodeURIComponent(selectedOrder.id)}`, selectedOrder, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      await fetchProductionOrders();

      setIsEditOpen(false);
      setSelectedOrder(null);

      setModalMessage('생산 오더가 수정되었습니다.');
      setIsModalOpen(true);
    } catch (error) {
      console.error('생산 오더 수정 실패: ', error);

      setModalMessage('생산 오더 수정에 실패했습니다.');
      setIsModalOpen(true);
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    const confirmed = window.confirm(
      `${selectedOrder.id} 생산 오더를 정말 삭제하시겠습니까?\n삭제한 데이터는 복구할 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:8080/api/production/orders/${encodeURIComponent(selectedOrder.id)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      await fetchProductionOrders();

      setIsEditOpen(false);
      setSelectedOrder(null);

      setModalMessage('생산 오더가 삭제되었습니다.');
      setIsModalOpen(true);
    } catch (error) {
      console.error('생산 오더 삭제 실패:', error);
      setModalMessage('생산 오더 삭제에 실패했습니다.');
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Layout>
        <div className={view.page}>
          <header className={dataViewStyles.pageHeader}>
            <div>
              <h1>생산관리</h1>
              <p>생산 오더의 진행 상태와 납기 일정을 확인합니다.</p>
            </div>
            <div className={dataViewStyles.pageActions}>
              <button onClick={() => setIsAddOpen(true)} className={buttonStyles.button}>
                신규 오더 등록
              </button>
            </div>
          </header>
          <div className={dataViewStyles.statsGrid}>
            <section className={dataViewStyles.statCard} data-tone="default">
              <span className={dataViewStyles.statLabel}>진행중인 오더</span>
              <strong className={dataViewStyles.statValue}>{progressCount}건</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="production" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="default">
              <span className={dataViewStyles.statLabel}>생산 대기</span>
              <strong className={dataViewStyles.statValue}>{planningCount}건</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="calendar" size={19} />
              </span>
            </section>
            <section className={dataViewStyles.statCard} data-tone="success">
              <span className={dataViewStyles.statLabel}>이번 달 완료</span>
              <strong className={dataViewStyles.statValue}>{completedThisMonth}건</strong>
              <span className={dataViewStyles.statDecoration}>
                <Icon name="check" size={19} />
              </span>
            </section>
          </div>
          <section className={dataViewStyles.panel}>
            <header className={dataViewStyles.panelHeader}>
              <h2>생산 오더 목록</h2>
            </header>
            <div className={dataViewStyles.tableScroller}>
              <table className={dataViewStyles.table}>
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
                <tbody>
                  {orders.map((order) => {
                    const badge = getBadgeStyle(order.status);
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.id}</strong>
                        </td>
                        <td>{order.productName}</td>
                        <td>{order.quantity.toLocaleString()} 개</td>
                        <td>
                          <span
                            data-tone={badge.bg as 'primary' | 'success' | 'secondary'}
                            className={dataViewStyles.badge}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td>
                          <div className={view.progress}>
                            <span>{order.progress}%</span>
                            <div className={view.progressTrack}>
                              <div
                                className={view.progressFill}
                                data-completed={order.status === 'completed' || undefined}
                                role="progressbar"
                                style={{ width: order.progress + '%' }}
                                aria-valuenow={order.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{order.dueDate}</td>
                        <td className={view.center}>
                          <button
                            data-variant="outline"
                            data-size="small"
                            className={buttonStyles.button}
                            onClick={() => {
                              setSelectedOrder({ ...order });
                              setIsEditOpen(true);
                            }}
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Layout>

      {isAddOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-order-title"
            style={{
              backgroundColor: 'white',
              padding: '28px',
              borderRadius: '12px',
              width: '420px',
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
          >
            <h2 id="add-order-title">신규 생산 오더 등록</h2>

            <p>새로운 생산 오더 정보를 입력해주세요.</p>

            <label htmlFor="new-product">제품명</label>
            <input
              id="new-product"
              style={inputStyle}
              placeholder="제품명을 입력하세요"
              value={newOrder.productName}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  productName: e.target.value,
                })
              }
            />

            <label htmlFor="new-quantity">생산 수량</label>
            <input
              id="new-quantity"
              type="number"
              min="1"
              style={inputStyle}
              value={newOrder.quantity}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  quantity: Number(e.target.value),
                })
              }
            />

            <label htmlFor="new-status">생산 상태</label>
            <select
              id="new-status"
              style={inputStyle}
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  status: e.target.value as ProductionOrder['status'],
                })
              }
            >
              <option value="planning">생산 대기</option>
              <option value="progress">생산 중</option>
              <option value="completed">생산 완료</option>
            </select>

            <label htmlFor="new-progress">진행률 (%)</label>
            <input
              id="new-progress"
              type="number"
              min="0"
              max="100"
              style={inputStyle}
              value={newOrder.progress}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  progress: Number(e.target.value),
                })
              }
            />

            <label htmlFor="new-due-date">납기일</label>
            <input
              id="new-due-date"
              type="date"
              style={inputStyle}
              value={newOrder.dueDate}
              onChange={(e) =>
                setNewOrder({
                  ...newOrder,
                  dueDate: e.target.value,
                })
              }
            />

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className={buttonStyles.button}
                onClick={() => setIsAddOpen(false)}
              >
                취소
              </button>

              <button
                type="button"
                className={buttonStyles.button}
                onClick={handleAddOrder}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && selectedOrder && (
        <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        >
          <div role='dialog' aria-modal="true" aria-labelledby='edit-order-title'
          style={{
            backgroundColor: 'white',
            padding: '28px',
            borderRadius: '12px',
            width: '420px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
          }}
          >
            <h2 id='edit-order-title'>생산 오더 수정</h2>

            <p>오더 번호: {selectedOrder.id}</p>

            <label>제품명</label>
            <input style={inputStyle} value={selectedOrder.productName}
            onChange={(e) => setSelectedOrder({
              ...selectedOrder,
              productName: e.target.value
            })}
            />

            <label>생산 수량</label>
            <input type='number' min="1" style={inputStyle} value={selectedOrder.quantity}
            onChange={(e) => setSelectedOrder({
              ...selectedOrder,
              quantity: Number(e.target.value)
            })}
            />

            <label>생산 상태</label>
            <select style={inputStyle} value={selectedOrder.status}
            onChange={(e) => setSelectedOrder({
              ...selectedOrder,
              status: e.target.value as ProductionOrder['status']
            })}
            >
              <option value="planning">생산 대기</option>
              <option value="progress">생산 중</option>
              <option value="completed">생산 완료</option>
            </select>

            <label>진행률 (%)</label>
            <input type='number' min="0" max="100" style={inputStyle} value={selectedOrder.progress}
            onChange={(e) => setSelectedOrder({
              ...selectedOrder,
              progress: Number(e.target.value)
            })}
            />

            <label>납기일</label>
            <input type='date' style={inputStyle} value={selectedOrder.dueDate}
            onChange={(e) => setSelectedOrder({
              ...selectedOrder,
              dueDate: e.target.value
            })}
            />
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button type='button' className={buttonStyles.button}
              onClick={() => {
                setIsEditOpen(false);
                setSelectedOrder(null);
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1'
              }}
              >취소</button>

              <button type='button' className={buttonStyles.button} onClick={handleDeleteOrder}
              style={{
                backgroundColor: '#fff',
                color: '#dc2626',
                border: '1px solid #fca5a5'
              }}
              >오더 삭제</button>

              <button type='button' className={buttonStyles.button} onClick={handleUpdateOrder}
              style={{
                backgroundColor: '#3461eb',
                color: '#fff',
                border: '1px solid #3461eb'
              }}
              >수정 저장</button>
            </div>
          </div>
        </div>
      )}

      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleCloseModal} />
    </>
  );
}
