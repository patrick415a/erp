'use client';

import { erpClient } from '@/app/api/erpClient';
import { useAccess } from '@/store/access';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import dataViewStyles from '@/assets/common/DataView.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';
import settingsStyles from '@/assets/dashboard/settings/Settings.module.scss';
import modalStyles from '@/assets/modal/WorkFormModal.module.scss';
import AlertModal, { type AlertNotice } from '@/components/modal/AlertModal';
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { StatusSearch } from '@/components/ui/StatusSearch';

type StockStatus = 'normal' | 'low' | 'out';

interface ItemFields {
  name: string;
  category: string | null;
  stock: number;
  unitPrice: number;
}

interface InventoryItem extends ItemFields {
  id: string;
  status: StockStatus | null;
}

const categories = ['원자재', '부품', '포장재', '소모품'];
const defaultItem: ItemFields = { name: '', category: '부품', stock: 0, unitPrice: 0 };
const itemsPerPage = 10;
const stockStatuses = {
  normal: { label: '정상', tone: 'success' },
  low: { label: '재고부족', tone: 'warning' },
  out: { label: '품절', tone: 'danger' },
};

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out';
  return stock <= 20 ? 'low' : 'normal';
}

function StockBadge({ status }: { status: InventoryItem['status'] }) {
  const badge = (status && stockStatuses[status]) || { label: '알수없음', tone: 'secondary' };
  return <span data-tone={badge.tone} className={dataViewStyles.badge}>{badge.label}</span>;
}

interface ItemDialogProps {
  title: string;
  item: ItemFields;
  itemId?: string;
  isSaving: boolean;
  onChange: (item: ItemFields) => void;
  onClose: () => void;
  onSave: () => void;
}

function ItemDialog({ title, item, itemId, isSaving, onChange, onClose, onSave }: ItemDialogProps) {
  const id = useId();
  const submitLabel = itemId ? '수정 저장' : '품목 등록';
  const pendingLabel = itemId ? '저장 중...' : '등록 중...';

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.dialog} role="dialog" aria-modal="true" aria-labelledby={id + '-title'}>
        <h2 id={id + '-title'} className={modalStyles.title}>{title}</h2>
        <div className={modalStyles.fields}>
          {itemId && (
            <div className={formControlsStyles.field}>
              <label htmlFor={id + '-code'}>품목 코드</label>
              <input id={id + '-code'} className={formControlsStyles.input} value={itemId} readOnly />
            </div>
          )}
          <div className={formControlsStyles.field}>
            <label htmlFor={id + '-name'}>품목명</label>
            <input
              id={id + '-name'}
              className={formControlsStyles.input}
              placeholder={itemId ? undefined : '품목명을 입력하세요'}
              value={item.name}
              onChange={(event) => onChange({ ...item, name: event.target.value })}
            />
          </div>
          <div className={formControlsStyles.field}>
            <label htmlFor={id + '-category'}>분류</label>
            <select
              id={id + '-category'}
              className={formControlsStyles.input}
              value={item.category ?? ''}
              onChange={(event) => onChange({ ...item, category: event.target.value || null })}
            >
              {!item.category && <option value="">미분류</option>}
              {item.category && !categories.includes(item.category) && (
                <option value={item.category}>{item.category}</option>
              )}
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div className={modalStyles.fieldRow}>
            <div className={formControlsStyles.field}>
              <label htmlFor={id + '-stock'}>현재고</label>
              <input
                id={id + '-stock'}
                type="number"
                min="0"
                step="1"
                className={formControlsStyles.input}
                value={item.stock}
                onChange={(event) => onChange({ ...item, stock: Number(event.target.value) })}
              />
            </div>
            <div className={formControlsStyles.field}>
              <label htmlFor={id + '-price'}>단가 (원)</label>
              <input
                id={id + '-price'}
                type="number"
                min="0"
                step="1"
                className={formControlsStyles.input}
                value={item.unitPrice}
                onChange={(event) => onChange({ ...item, unitPrice: Number(event.target.value) })}
              />
            </div>
          </div>
        </div>
        <div className={modalStyles.actions}>
          <button type="button" className={buttonStyles.button} data-variant="outline" disabled={isSaving} onClick={onClose}>
            취소
          </button>
          <button type="button" className={buttonStyles.button} disabled={isSaving} onClick={onSave}>
            {isSaving ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InventoryItems({ variant }: { variant: 'inventory' | 'master' }) {
  const isMaster = variant === 'master';
  const inventoryUrl = isMaster ? '/api/settings/items' : '/api/inventory/items';
  const { can } = useAccess();
  const canCreate = can(isMaster ? 'SETTINGS_CREATE' : 'INVENTORY_CREATE');
  const canUpdate = can(isMaster ? 'SETTINGS_UPDATE' : 'INVENTORY_UPDATE');
  const canDelete = can(isMaster ? 'SETTINGS_DELETE' : 'INVENTORY_DELETE');
  const showActions = canUpdate || canDelete;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [{ keyword, status }, setSearch] = useState({ keyword: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState(defaultItem);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<AlertNotice | null>(null);
  const activeRead = useRef<AbortController | null>(null);

  const fetchItems = useCallback(() => {
    activeRead.current?.abort();
    const controller = new AbortController();
    activeRead.current = controller;

    return erpClient.get<InventoryItem[]>(inventoryUrl, { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setItems(data);
        setLoadError(false);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('재고 목록 조회 실패:', error);
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
  }, [inventoryUrl]);

  useEffect(() => {
    void fetchItems();
    return () => {
      activeRead.current?.abort();
      activeRead.current = null;
    };
  }, [fetchItems]);

  const saveItem = async (item: ItemFields, itemId?: string) => {
    if (isSaving || !(itemId ? canUpdate : canCreate)) return;

    const name = item.name.trim();
    if (!name) {
      setNotice({ message: '품목명을 입력해주세요.', status: 'error' });
      return;
    }

    const isValidNumber = itemId ? Number.isInteger : Number.isFinite;
    if (!isValidNumber(item.stock) || !isValidNumber(item.unitPrice) || item.stock < 0 || item.unitPrice < 0) {
      setNotice({
        message: itemId ? '현재고와 단가는 0 이상의 정수로 입력해주세요.' : '재고 수량과 단가를 확인해주세요.',
        status: 'error',
      });
      return;
    }

    const data = {
      name,
      category: item.category,
      stock: item.stock,
      unitPrice: item.unitPrice,
      status: getStockStatus(item.stock),
    };
    setIsSaving(true);
    try {
      if (itemId) {
        const { data: updatedItem } = await erpClient.put<InventoryItem>(inventoryUrl + '/' + encodeURIComponent(itemId), data);
        setItems((current) => current.map((row) => row.id === itemId ? updatedItem : row));
        setEditingItem(null);
      } else {
        const { data: createdItem } = await erpClient.post<InventoryItem>(inventoryUrl, data);
        setItems((current) => [...current.filter((row) => row.id !== createdItem.id), createdItem]);
        setIsAddModalOpen(false);
        setNewItem(defaultItem);
      }

      if (activeRead.current) await fetchItems();
      setNotice({ message: itemId ? '재고 정보가 수정되었습니다.' : '신규 품목이 등록되었습니다.', status: 'success' });
    } catch (error) {
      console.error('품목 저장 실패:', error);
      setNotice({ message: itemId ? '재고 수정에 실패했습니다.' : '품목 등록에 실패했습니다.', status: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!canDelete || !deletingItem || isSaving) return;

    const { id } = deletingItem;
    setIsSaving(true);
    try {
      await erpClient.delete(inventoryUrl + '/' + encodeURIComponent(id));
      setItems((current) => current.filter((item) => item.id !== id));
      if (activeRead.current) await fetchItems();
      setNotice({ message: '품목이 삭제되었습니다.', status: 'success' });
    } catch (error) {
      console.error('재고 삭제 실패:', error);
      setNotice({ message: '품목 삭제에 실패했습니다.', status: 'error' });
    } finally {
      setDeletingItem(null);
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter((item) =>
    (!status || item.status === status) &&
    (item.name.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword))
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const emptyMessage = keyword || status ? '검색 결과가 없습니다.' : isMaster ? '등록된 품목이 없습니다.' : '등록된 재고가 없습니다.';
  const listMessage = isLoading
    ? '품목 목록을 불러오는 중입니다.'
    : loadError && items.length === 0
      ? '품목 목록을 불러오지 못했습니다.'
      : filteredItems.length === 0 ? emptyMessage : null;

  const addButton = canCreate && (
    <button type="button" className={buttonStyles.button} disabled={isSaving} onClick={() => setIsAddModalOpen(true)}>
      신규 품목 등록
    </button>
  );
  const search = (
    <StatusSearch
      keywordLabel="품목명 또는 코드 검색"
      statusLabel="재고 상태"
      statuses={stockStatuses}
      onSearch={(keyword, status) => {
        setSearch({ keyword, status });
        setCurrentPage(1);
      }}
    />
  );

  return (
    <>
      {!isMaster && (
        <>
          <header className={dataViewStyles.pageHeader}>
            <div>
              <h1>재고관리</h1>
              <p>품목별 재고 수량과 자산 현황을 확인합니다.</p>
            </div>
            {addButton && <div className={dataViewStyles.pageActions}>{addButton}</div>}
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
        </>
      )}

      <div className={isMaster ? undefined : dataViewStyles.panel}>
        {isMaster ? (
          <div className={settingsStyles.itemToolbar}>{addButton}{search}</div>
        ) : (
          <header className={dataViewStyles.panelHeader}>
            <h2>현재고 현황</h2>
            {search}
          </header>
        )}

        <div className={dataViewStyles.tableScroller + (isMaster ? ' ' + settingsStyles.itemTable : '')}>
          <table className={dataViewStyles.table}>
            <thead>
              <tr>
                <th>품목 코드</th>
                <th>품목명</th>
                <th>분류</th>
                {!isMaster && <th className={view.number}>현재고</th>}
                <th className={view.number}>{isMaster ? '기준 단가' : '단가 (원)'}</th>
                <th className={view.center}>상태</th>
                {showActions && <th className={view.center}>관리</th>}
              </tr>
            </thead>
            <tbody>
              {listMessage ? (
                <tr>
                  <td colSpan={5 + Number(!isMaster) + Number(showActions)} className={dataViewStyles.tableMessage}>
                    <p role="status">{listMessage}</p>
                  </td>
                </tr>
              ) : visibleItems.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td className={view.itemName}>{item.name}</td>
                  <td>{item.category}</td>
                  {!isMaster && <td className={view.number}><strong>{item.stock.toLocaleString()}</strong></td>}
                  <td className={view.number}>{item.unitPrice.toLocaleString()}{isMaster && '원'}</td>
                  <td className={view.center}><StockBadge status={item.status} /></td>
                  {showActions && <td>
                    <div className={view.rowActions}>
                      {canUpdate && <button type="button" className={buttonStyles.button} data-variant="outline" data-size="small" disabled={isSaving} onClick={() => setEditingItem({ ...item })}>수정</button>}
                      {canDelete && <button type="button" className={buttonStyles.button} data-variant="danger" data-size="small" disabled={isSaving} onClick={() => setDeletingItem(item)}>삭제</button>}
                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!listMessage && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} label={isMaster ? '품목 마스터 목록 페이지' : '재고 목록 페이지'} />
        )}
      </div>

      {canCreate && isAddModalOpen && (
        <ItemDialog
          title={isMaster ? '신규 품목 마스터 등록' : '신규 품목 등록'}
          item={newItem}
          isSaving={isSaving}
          onChange={setNewItem}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => void saveItem(newItem)}
        />
      )}
      {canUpdate && editingItem && (
        <ItemDialog
          title={isMaster ? '품목 마스터 수정' : '재고 정보 수정'}
          item={editingItem}
          itemId={editingItem.id}
          isSaving={isSaving}
          onChange={(fields) => setEditingItem({ ...editingItem, ...fields })}
          onClose={() => setEditingItem(null)}
          onSave={() => void saveItem(editingItem, editingItem.id)}
        />
      )}
      {canDelete && deletingItem && (
        <DeleteConfirmModal
          message={deletingItem.name + ' (' + deletingItem.id + ') 품목을 삭제하시겠습니까?'}
          isDeleting={isSaving}
          onClose={() => setDeletingItem(null)}
          onConfirm={deleteItem}
        />
      )}
      {notice && <AlertModal isOpen {...notice} onClose={() => setNotice(null)} />}
    </>
  );
}
