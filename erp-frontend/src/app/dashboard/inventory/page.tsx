'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import { Icon } from '@/components/ui/Icon';

import { Layout } from '@/components/Layout';
import AlertModal, { type AlertNotice } from '@/components/modal/AlertModal';
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal';
import axios from 'axios';
import { useEffect, useState } from 'react';
import view from '@/assets/dashboard/WorkPage.module.scss';
import modalStyles from '@/assets/modal/WorkFormModal.module.scss';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
  status: 'normal' | 'low' | 'out';
}

export default function InventoryPage() {
  const [notice, setNotice] = useState<AlertNotice | null>(null);

  // 재고 데이터
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //재고 검색
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  //신규 품목 등록창
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 재고 수정창
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // 재고 상태 자동 계산
  const getStockStatus = (stock: number): InventoryItem['status'] => {
    if (stock === 0) return 'out';
    if (stock <= 20) return 'low';
    return 'normal';
  };

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

      const response = await axios.get<InventoryItem[]>('http://localhost:8080/api/inventory/items');
      setItems(response.data);
    } catch (error) {
      console.error('재고 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 신규 품목 등록
  const handleAddItem = async () => {
    if (isSaving) return;

    if (!newItem.name.trim()) {
      setNotice({ message: '품목명을 입력해주세요.', status: 'error' });
      return;
    }

    if (
      !Number.isFinite(newItem.stock) ||
      !Number.isFinite(newItem.unitPrice) ||
      newItem.stock < 0 ||
      newItem.unitPrice < 0
    ) {
      setNotice({ message: '재고 수량과 단가를 확인해주세요.', status: 'error' });
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

      setNotice({ message: '신규 품목이 등록되었습니다.', status: 'success' });
    } catch (error) {
      console.error('품목 등록 실패:', error);
      setNotice({ message: '품목 등록에 실패했습니다.', status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 재고 수정 저장
  const handleUpdateItem = async () => {
    if (!editingItem || isSaving) return;
    
    if (!editingItem.name.trim()) {
      setNotice({ message: '품목명을 입력해주세요.', status: 'error' });
      return;
    }

    if (
      !Number.isInteger(editingItem.stock) ||
      !Number.isInteger(editingItem.unitPrice) ||
      editingItem.stock < 0 ||
      editingItem.unitPrice < 0
    ) {
      setNotice({ message: '현재고와 단가는 0 이상의 정수로 입력해주세요.', status: 'error' });
      return;
    }

    try {
      setIsSaving(true);

      await axios.put(`http://localhost:8080/api/inventory/items/${encodeURIComponent(editingItem.id)}`, {
        name: editingItem.name.trim(),
        category: editingItem.category,
        stock: editingItem.stock,
        unitPrice: editingItem.unitPrice,
        status: getStockStatus(editingItem.stock),
      });

      setEditingItem(null);
      await fetchInventoryItems();

      setNotice({ message: '재고 정보가 수정되었습니다.', status: 'success' });
    } catch (error) {
      console.error('재고 수정 실패:', error);
      setNotice({ message: '재고 수정에 실패했습니다.', status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 재고 삭제
  const handleDeleteItem = async () => {
    if (!deletingItem || isSaving) return;

    try {
      setIsSaving(true);
      await axios.delete(`http://localhost:8080/api/inventory/items/${encodeURIComponent(deletingItem.id)}`);
      await fetchInventoryItems();

      setNotice({ message: '품목이 삭제되었습니다.', status: 'success' });
    } catch (error) {
      console.error('재고 삭제 실패:', error);
      setNotice({ message: '품목 삭제에 실패했습니다.', status: 'error' });
    } finally {
      setDeletingItem(null);
      setIsSaving(false);
    }
  };

  //품목명 또는 품목 코드 검색
  const handleSearch = () => {
    setSearchKeyword(searchInput.trim());
    setCurrentPage(1);
  };

  //검색 결과 필터링
  const filteredItems = items.filter((item) => {
    const keyword = searchKeyword.toLowerCase();

    return (
      item.name.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword)
    );
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return (
          <span data-tone="success" className={dataViewStyles.badge}>정상</span>
        );
      case 'low':
        return (
          <span data-tone="warning" className={dataViewStyles.badge}>재고부족</span>
        );
      case 'out':
        return (
          <span data-tone="danger" className={dataViewStyles.badge}>품절</span>
        );
      default:
        return (
          <span data-tone="secondary" className={dataViewStyles.badge}>알수없음</span>
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
              {'₩ ' + items.reduce((acc, curr) => acc + curr.stock * curr.unitPrice, 0).toLocaleString()}
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
                <input className={formControlsStyles.input} placeholder="품목명 또는 코드 검색..." aria-label="품목명 또는 코드 검색" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}/>
                <button className={buttonStyles.button} data-variant="outline" data-size="small" onClick={handleSearch}>검색</button>
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
                    <td colSpan={7} className={dataViewStyles.tableMessage}>
                      재고 목록을 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={dataViewStyles.tableMessage}>
                      {searchKeyword ? '검색 결과가 없습니다.' : '등록된 재고가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
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
                          <button data-variant="outline" data-size="small" className={buttonStyles.button} onClick={() => setEditingItem({ ...item })}>수정</button>
                          <button data-variant="danger" data-size="small" className={buttonStyles.button} onClick={() => setDeletingItem(item)}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredItems.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px' }}>
              <button type='button' className={buttonStyles.button} data-variant="outline" data-size="small" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}>이전</button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} type='button' className={buttonStyles.button} data-variant={safeCurrentPage === page ? undefined : 'outline'} data-size="small" onClick={() => setCurrentPage(page)}>{page}</button>
              ))}

              <button type='button' className={buttonStyles.button} data-variant="outline" data-size="small" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(safeCurrentPage + 1)}>다음</button>
            </div>
          )}

        </section>
      </div>
    </Layout>

    {isAddModalOpen && (
      <div className={modalStyles.overlay}>
        <div className={modalStyles.dialog} role="dialog" aria-modal="true" aria-labelledby="add-inventory-title">
          <h2 id="add-inventory-title" className={modalStyles.title}>신규 품목 등록</h2>

          <div className={modalStyles.fields}>
            <div className={formControlsStyles.field}>
              <label htmlFor="inventory-name">품목명</label>
              <input id="inventory-name" className={formControlsStyles.input} placeholder="품목명을 입력하세요" value={newItem.name}
              onChange={(e) => setNewItem({
                ...newItem,
                name: e.target.value,
              })}/>
            </div>

            <div className={formControlsStyles.field}>
              <label htmlFor="inventory-category">분류</label>
              <select id="inventory-category" className={formControlsStyles.input} value={newItem.category} onChange={(e) =>
              setNewItem({
                ...newItem,
                category: e.target.value,
              })}>
                <option value="원자재">원자재</option>
                <option value="부품">부품</option>
                <option value="포장재">포장재</option>
                <option value="소모품">소모품</option>
              </select>
            </div>

            <div className={modalStyles.fieldRow}>
              <div className={formControlsStyles.field}>
                <label htmlFor="inventory-stock">현재고</label>
                <input id="inventory-stock" type="number" min="0" step="1" className={formControlsStyles.input} value={newItem.stock}
                onChange={(e) => setNewItem({
                  ...newItem,
                  stock: Number(e.target.value),
                })}/>
              </div>

              <div className={formControlsStyles.field}>
                <label htmlFor="inventory-price">단가 (원)</label>
                <input id="inventory-price" type="number" min="0" step="1" className={formControlsStyles.input} value={newItem.unitPrice}
                onChange={(e) => setNewItem({
                  ...newItem,
                  unitPrice: Number(e.target.value),
                })}/>
              </div>
            </div>
          </div>

          <div className={modalStyles.actions}>
            <button type="button" className={buttonStyles.button} data-variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}>취소</button>

            <button type="button" className={buttonStyles.button} onClick={handleAddItem} disabled={isSaving}>{isSaving ? '등록 중...' : '품목 등록'}</button>
          </div>
        </div>
      </div>
    )}

    {editingItem && (
      <div className={modalStyles.overlay}>
        <div className={modalStyles.dialog} role="dialog" aria-modal="true" aria-labelledby="edit-inventory-title">
          <h2 id="edit-inventory-title" className={modalStyles.title}>재고 정보 수정</h2>

          <div className={modalStyles.fields}>
            <div className={formControlsStyles.field}>
              <label htmlFor="edit-item-code">품목 코드</label>
              <input id="edit-item-code" className={formControlsStyles.input} value={editingItem.id} readOnly/>
            </div>

            <div className={formControlsStyles.field}>
              <label htmlFor="edit-item-name">품목명</label>
              <input id="edit-item-name" className={formControlsStyles.input} value={editingItem.name}
              onChange={(e) => setEditingItem({
                ...editingItem,
                name: e.target.value,
              })}/>
            </div>

            <div className={formControlsStyles.field}>
              <label htmlFor="edit-item-category">분류</label>
              <select id="edit-item-category" className={formControlsStyles.input} value={editingItem.category}
              onChange={(e) => setEditingItem({
                ...editingItem,
                category: e.target.value,
              })}>
                <option value="원자재">원자재</option>
                <option value="부품">부품</option>
                <option value="포장재">포장재</option>
                <option value="소모품">소모품</option>
              </select>
            </div>

            <div className={modalStyles.fieldRow}>
              <div className={formControlsStyles.field}>
                <label htmlFor="edit-item-stock">현재고</label>
                <input id="edit-item-stock" type="number" min="0" step="1" className={formControlsStyles.input} value={editingItem.stock}
                onChange={(e) => setEditingItem({
                  ...editingItem,
                  stock: Number(e.target.value),
                })}/>
              </div>

              <div className={formControlsStyles.field}>
                <label htmlFor="edit-item-price">단가 (원)</label>
                <input id="edit-item-price" type="number" min="0" step="1" className={formControlsStyles.input} value={editingItem.unitPrice}
                onChange={(e) => setEditingItem({
                  ...editingItem,
                  unitPrice: Number(e.target.value),
                })}/>
              </div>
            </div>
          </div>

          <div className={modalStyles.actions}>
            <button type="button" className={buttonStyles.button} data-variant="outline" disabled={isSaving} onClick={() => setEditingItem(null)}>취소</button>

            <button type="button" className={buttonStyles.button} disabled={isSaving} onClick={handleUpdateItem}>{isSaving ? '저장 중...' : '수정 저장'}</button>
          </div>
        </div>
      </div>
    )}

    {deletingItem && (
      <DeleteConfirmModal message={`${deletingItem.name} (${deletingItem.id}) 품목을 삭제하시겠습니까?`} isDeleting={isSaving} onClose={() => setDeletingItem(null)} onConfirm={handleDeleteItem}/>
    )}
    {notice && <AlertModal isOpen {...notice} onClose={() => setNotice(null)} />}
    </>
  );
}
