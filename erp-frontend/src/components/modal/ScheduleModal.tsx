'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

import { Icon } from '@/components/ui/Icon';
import { Temporal } from '@js-temporal/polyfill';
import { useEffect, useState } from 'react';
import ModalLayout from './ModalLayout';
import type { Schedule } from '@/app/types/schedule';
export type { Schedule } from '@/app/types/schedule';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  selectedDate: number | null;
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  year,
  month,
  selectedDate,
  schedules,
  setSchedules,
}: ScheduleModalProps) {
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'대기' | '진행' | '완료'>('대기');
  const [editingId, setEditingId] = useState<string | null>(null);

  //커스텀 셀렉트 박스 열림 / 닫힘 상태
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  //모달이 열리거나 날짜가 바뀔대 입력창 초기화
  useEffect(() => {
    if (isOpen) {
      setFormContent('');
      setFormStatus('대기');
      setEditingId(null);
      setIsSelectOpen(false); //모달 열릴때 드롭다운 닫기
    }
  }, [isOpen, selectedDate]);

  if (!isOpen || selectedDate === null) return null;

  const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

  const handleSave = () => {
    if (!formContent.trim()) return;

    const currentTime = Temporal.Now.plainTimeISO().toString().split('.')[0];

    if (editingId) {
      setSchedules((prev) =>
        prev.map((sch) =>
          sch.id === editingId
            ? {
                ...sch,
                content: formContent,
                status: formStatus,
              }
            : sch
        )
      );
    } else {
      setSchedules((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          date: fullDate,
          content: formContent,
          status: formStatus,
          createdAt: currentTime,
        },
      ]);
    }
    setFormContent('');
    setFormStatus('대기');
    setEditingId(null);
  };

  const handleEdit = (sch: Schedule) => {
    setFormContent(sch.content);
    setFormStatus(sch.status);
    setEditingId(sch.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      setSchedules((prev) => prev.filter((sch) => sch.id !== id));
      if (editingId === id) {
        setFormContent('');
        setEditingId(null);
      }
    }
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title={`${month}월 ${selectedDate}일 업무 일정`}>
      <div className={modalPartsStyles.formGroup}>
        <div className={formControlsStyles.selectContainer}>
          <div
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            className={formControlsStyles.selectTrigger}
          >
            {formStatus}
            <Icon name={isSelectOpen ? 'up' : 'down'} size={16} style={{ color: '#94a3b8' }} />
          </div>
          {isSelectOpen && (
            <ul className={formControlsStyles.selectList}>
              {['대기', '진행', '완료'].map((status) => (
                <li
                  key={status}
                  onClick={() => {
                    setFormStatus(status as '대기' | '진행' | '완료');
                    setIsSelectOpen(false);
                  }}
                  data-selected={formStatus === status || undefined}
                  className={formControlsStyles.selectItem}
                >
                  {status}
                </li>
              ))}
            </ul>
          )}
        </div>

        <textarea
          placeholder="일정 내용을 입력하세요..."
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
          className={formControlsStyles.textarea}
        />
      </div>

      <div className={modalPartsStyles.actions}>
        <button onClick={handleSave} data-variant="primary" className={buttonStyles.button}>
          {editingId ? '수정' : '등록'}
        </button>
        <button onClick={onClose} data-variant="gray" className={buttonStyles.button}>
          닫기
        </button>
      </div>

      <ul className={modalPartsStyles.scheduleList}>
        {schedules
          .filter((sch) => sch.date === fullDate)
          .map((sch) => (
            <li key={sch.id} className={modalPartsStyles.scheduleItem}>
              <div className={modalPartsStyles.scheduleHeader}>
                <span data-status={sch.status} className={modalPartsStyles.badge}>
                  {sch.status}
                </span>
                <span>{sch.createdAt}작성</span>
              </div>
              <div className="">{sch.content}</div>
              <div className={modalPartsStyles.actions}>
                <button
                  onClick={() => handleEdit(sch)}
                  data-variant="kakao"
                  data-size="small"
                  className={buttonStyles.button}
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(sch.id)}
                  data-variant="danger"
                  data-size="small"
                  className={buttonStyles.button}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
      </ul>
    </ModalLayout>
  );
}
