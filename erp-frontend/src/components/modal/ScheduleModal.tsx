"use client";

import * as UI from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";
import ModalLayout from "./ModalLayout";
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

export default function ScheduleModal({ isOpen, onClose, year, month, selectedDate, schedules, setSchedules }: ScheduleModalProps) {
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"대기" | "진행" | "완료">("대기");
  const [editingId, setEditingId] = useState<string | null>(null);

  //커스텀 셀렉트 박스 열림 / 닫힘 상태
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  //모달이 열리거나 날짜가 바뀔대 입력창 초기화
  useEffect(() => {
    if (isOpen) {
      setFormContent("");
      setFormStatus("대기");
      setEditingId(null);
      setIsSelectOpen(false); //모달 열릴때 드롭다운 닫기
    }
  }, [isOpen, selectedDate]);

  if (!isOpen || selectedDate === null) return null;

  const fullDate = `${year}-${String(month).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

  const handleSave = () => {
    if (!formContent.trim()) return;

    const currentTime = Temporal.Now.plainTimeISO().toString().split(".")[0];

    if (editingId) {
      setSchedules((prev) =>
        prev.map((sch) => sch.id === editingId ? {
          ...sch,
          content: formContent,
          status: formStatus
        } : sch)
      );
    } else {
      setSchedules((prev) => [
        ...prev, {
          id: crypto.randomUUID(),
          date: fullDate,
          content: formContent,
          status: formStatus,
          createdAt: currentTime,
        },
      ]);
    }
    setFormContent("");
    setFormStatus("대기");
    setEditingId(null);
  };

  const handleEdit = (sch: Schedule) => {
    setFormContent(sch.content);
    setFormStatus(sch.status);
    setEditingId(sch.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("일정을 삭제하시겠습니까?")) {
      setSchedules((prev) => prev.filter((sch) => sch.id !== id));
      if (editingId === id) {
        setFormContent("");
        setEditingId(null);
      }
    }
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title={`${month}월 ${selectedDate}일 업무 일정`}>
      <UI.FormGroup>
        <UI.CustomSelectContainer>
          <UI.SelectTrigger onClick={() => setIsSelectOpen(!isSelectOpen)}>
            {formStatus}
            <Icon name={isSelectOpen ? 'up' : 'down'} size={16} style={{ color: '#94a3b8' }} />
          </UI.SelectTrigger>
          {isSelectOpen && (
            <UI.SelectList>
              {["대기", "진행", "완료"].map((status) => (
                <UI.SelectItem
                  key={status}
                  isSelected={formStatus === status}
                  onClick={() => {
                    setFormStatus(status as "대기" | "진행" | "완료");
                    setIsSelectOpen(false);
                  }}
                >
                  {status}
                </UI.SelectItem>
              ))}
            </UI.SelectList>
          )}
        </UI.CustomSelectContainer>

        <UI.TextArea
          placeholder="일정 내용을 입력하세요..."
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
        />
      </UI.FormGroup>

      <UI.ButtonGroup>
        <UI.Button onClick={handleSave} variant="primary">
          {editingId ? "수정" : "등록"}
        </UI.Button>
        <UI.Button onClick={onClose} variant="gray">
          닫기
        </UI.Button>
      </UI.ButtonGroup>

      <UI.ScheduleList>
        {schedules.filter((sch) => sch.date === fullDate).map((sch) => (
          <UI.ScheduleItem key={sch.id}>
            <UI.ScheduleHeader>
              <UI.Badge status={sch.status}>
                {sch.status}
              </UI.Badge>
              <span>{sch.createdAt}작성</span>
            </UI.ScheduleHeader>
            <div className="">{sch.content}</div>
            <UI.ButtonGroup>
              <UI.Button onClick={() => handleEdit(sch)} size="small" variant="kakao">수정</UI.Button>
              <UI.Button onClick={() => handleDelete(sch.id)} size="small" variant="danger">삭제</UI.Button>
            </UI.ButtonGroup>
          </UI.ScheduleItem>
        ))}
      </UI.ScheduleList>
    </ModalLayout>
  );
}
