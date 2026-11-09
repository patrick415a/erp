'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import formControlsStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

import { Icon } from '@/components/ui/Icon';
import { Temporal } from '@js-temporal/polyfill';
import { useState } from 'react';
import ModalLayout from './ModalLayout';
import type { Schedule } from '@/app/types/schedule';
export type { Schedule } from '@/app/types/schedule';

interface ScheduleModalProps {
  onClose: () => void;
  year: number;
  month: number;
  selectedDate: number;
  schedules: Schedule[];
  setSchedules: (update: (current: Schedule[]) => Schedule[]) => void;
}

export default function ScheduleModal({
  onClose,
  year,
  month,
  selectedDate,
  schedules,
  setSchedules,
}: ScheduleModalProps) {
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<'대기' | '진행' | '완료'>('대기');
  const [editingId, setEditingId] = useState<string | null>(null);

  //커스텀 셀렉트 박스 열림 / 닫힘 상태
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

  const resetForm = () => {
    setFormTitle('');
    setFormTime('');
    setFormContent('');
    setFormStatus('대기');
    setEditingId(null);
    setIsSelectOpen(false);
  };

  const handleSave = () => {
    const title = formTitle.trim();
    const content = formContent.trim();
    if (!title && !content) return;
    const time = formTime || undefined;
    if (editingId) {
      setSchedules((prev) =>
        prev.map((sch) =>
          sch.id === editingId
            ? {
                ...sch,
                title,
                time,
                content,
                status: formStatus,
                notifiedFor: sch.time === time ? sch.notifiedFor : undefined,
              }
            : sch,
        ),
      );
    } else {
      const schedule: Schedule = {
        id: crypto.randomUUID(),
        date: fullDate,
        title,
        time,
        content,
        status: formStatus,
        createdAt: Temporal.Now.plainTimeISO().toString({ smallestUnit: 'second' }),
      };
      setSchedules((prev) => [...prev, schedule]);
    }
    resetForm();
  };

  const handleEdit = (sch: Schedule) => {
    setFormTitle(sch.title ?? '');
    setFormTime(sch.time ?? '');
    setFormContent(sch.content);
    setFormStatus(sch.status);
    setEditingId(sch.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      setSchedules((prev) => prev.filter((sch) => sch.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <ModalLayout isOpen onClose={onClose} title={`${month}월 ${selectedDate}일 업무 일정`}>
      <div className={modalPartsStyles.formGroup}>
        <div className={formControlsStyles.field}>
          <label className={formControlsStyles.label} htmlFor="schedule-title">
            일정 제목
          </label>
          <input
            id="schedule-title"
            className={formControlsStyles.input}
            value={formTitle}
            onChange={(event) => setFormTitle(event.target.value)}
            maxLength={100}
          />
        </div>
        <div className={formControlsStyles.field}>
          <label className={formControlsStyles.label} htmlFor="schedule-time">
            알림 시간 (선택)
          </label>
          <input
            id="schedule-time"
            type="time"
            className={formControlsStyles.input}
            value={formTime}
            onChange={(event) => setFormTime(event.target.value)}
          />
        </div>
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
          aria-label="일정 내용"
          placeholder="일정 내용을 입력하세요..."
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
          className={formControlsStyles.textarea}
        />
      </div>

      <div className={modalPartsStyles.actions}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!formTitle.trim() && !formContent.trim()}
          data-variant="primary"
          className={buttonStyles.button}
        >
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
                <span>{sch.time ? sch.time + ' 알림' : sch.createdAt + ' 작성'}</span>
              </div>
              {sch.title && <strong>{sch.title}</strong>}
              {sch.content && <p>{sch.content}</p>}
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
