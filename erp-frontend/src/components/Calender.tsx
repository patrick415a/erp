"use client";

import { Holiday } from "@/app/types/holiday";
import type { Schedule } from '@/app/types/schedule';
import * as UI from '@/components/ui';
import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState, type ReactNode } from "react";
import { fetchHolidays } from "../app/api/holidays";
import ScheduleModal from "./modal/ScheduleModal";
import { MonthlyScheduleList } from './calendar/MonthlyScheduleList';

// 현재 달(예: 9월)을 자동으로 가져오도록 추가
const Calendar = ({ year, month, thisMonth, controls }: { year: number; month: number; thisMonth: boolean; controls?: ReactNode; }) => {
  // 1. 해당 연/월의 1일을 명시적으로 직접 생성 (가장 안전한 방식)
  const targetYearMonth = Temporal.PlainYearMonth.from({ year, month });
  const firstDayDate = Temporal.PlainDate.from({ year, month, day: 1 });

  // 2. 일요일(7)을 배열 인덱스(0)로 변환
  const firstDayIndex = firstDayDate.dayOfWeek === 7 ? 0 : firstDayDate.dayOfWeek;
  // 3. 이번 달의 총 일수 추출
  const daysInMonth = firstDayDate.daysInMonth;

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  //모달에 관련된 추가
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHolidays(year, month).then(setHolidays);
  }, [year, month]);

  const today = Temporal.Now.plainDateISO();
  const isThisMonth = today.year === year && today.month === month;

  const getHoliday = (day: number) => holidays.find((h) => h.date === day);

  const hanldleDayClick = (day: number) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const days = [];

  // 앞부분 빈 칸 채우기
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<UI.DayCell key={`empty-${i}`} isEmpty />);
  }

  // 실제 날짜 채우기
  for (let d = 1; d <= daysInMonth; d++) {
    const holiday = getHoliday(d);
    const currentDayOfWeek = (firstDayIndex + d - 1) % 7;
    const isSunday = currentDayOfWeek === 0;
    const isSaturday = currentDayOfWeek === 6;

    // 해당 날짜에 등록된 일정이 있는지 확인 (파란 점 표시용)
    const fullDate = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hasSchedule = schedules.some((sch) => sch.date === fullDate);

    days.push(
      <UI.DayCell
        key={d}
        isToday={isThisMonth && today.day === d}
        isHoliday={!!holiday}
        isSunday={isSunday}     // 일요일 여부 전달
        isSaturday={isSaturday} // 토요일 여부 전달
        onClick={() => hanldleDayClick(d)}
        role="button"
        tabIndex={0}
        aria-label={`${year}년 ${month}월 ${d}일${holiday ? ` ${holiday.name}` : ''}`}
        aria-current={isThisMonth && today.day === d ? 'date' : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            hanldleDayClick(d);
          }
        }}
      >
        <span>{d}</span> {/* flex 구조에서 텍스트가 씹히지 않도록 span으로 감쌈 */}
        {holiday && <UI.Tooltip>{holiday.name}</UI.Tooltip>}
        {/* {holiday?.name === "성탄절" && <span style={{ marginTop: "4px" }}>🎄</span>}
        {holiday?.name.includes("추석") && <span>🌕</span>} */}
        {hasSchedule && <UI.ScheduleDot />}
      </UI.DayCell>
    );
  }

  // 마지막 주의 빈 칸까지 채워 달력의 구분선이 끝까지 이어지게 합니다.
  const trailingDays = (7 - (days.length % 7)) % 7;
  for (let i = 0; i < trailingDays; i++) {
    days.push(<UI.DayCell key={`trailing-${i}`} isEmpty />);
  }

  return (
    <UI.Calendar thismonth={thisMonth}>
      <UI.CalTopMargin >
        <UI.CalendarWrapper>
          <UI.CalendarToolbar>
            <UI.CalHeader>{year}년 {month}월</UI.CalHeader>
            {controls && <UI.CalendarNavigation>{controls}</UI.CalendarNavigation>}
          </UI.CalendarToolbar>
          <UI.Grid>
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <UI.DayName key={day}>{day}</UI.DayName>
            ))}
            {days}
          </UI.Grid>
        </UI.CalendarWrapper>
      </UI.CalTopMargin>

      <MonthlyScheduleList year={year} month={month} schedules={schedules} holidays={holidays} onSelectDate={hanldleDayClick} />

      {/* 분리한 스케줄 모달 컴포넌트 렌더링 */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        year={year}
        month={month}
        selectedDate={selectedDate}
        schedules={schedules}
        setSchedules={setSchedules}
      />
    </UI.Calendar>
  );
};

export default Calendar;
