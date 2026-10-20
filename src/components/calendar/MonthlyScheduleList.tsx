import type { Holiday } from '@/app/types/holiday';
import type { Schedule } from '@/app/types/schedule';
import { Temporal } from '@js-temporal/polyfill';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/ModalParts';
import styles from './MonthlyScheduleList.module.scss';

interface MonthlyScheduleListProps {
  year: number;
  month: number;
  schedules: Schedule[];
  holidays: Holiday[];
  onSelectDate: (day: number) => void;
}

const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function MonthlyScheduleList({ year, month, schedules, holidays, onSelectDate }: MonthlyScheduleListProps) {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
  // 달력과 같은 데이터를 사용합니다. 원본 배열을 바꾸지 않고 선택한 달만 날짜순으로 정렬합니다.
  const monthlySchedules = schedules
    .filter(schedule => schedule.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  const groups = new Map<string, { schedules: Schedule[]; holidays: Holiday[] }>();

  for (const schedule of monthlySchedules) {
    const group = groups.get(schedule.date) || { schedules: [], holidays: [] };
    group.schedules.push(schedule);
    groups.set(schedule.date, group);
  }
  // holidays.ts에서 해당 달에 불러온 공휴일을 등록 일정과 같은 날짜 묶음에 넣습니다.
  for (const holiday of holidays) {
    const date = monthPrefix + String(holiday.date).padStart(2, '0');
    const group = groups.get(date) || { schedules: [], holidays: [] };
    group.holidays.push(holiday);
    groups.set(date, group);
  }
  const sortedGroups = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <aside className={styles.panel} aria-label={`${year}년 ${month}월 일정 및 공휴일 목록`}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}><Icon name="calendar" size={19} /></span>
          <h2>{month}월 일정</h2>
        </div>
        <p>등록 일정 <strong>{monthlySchedules.length}건</strong><span>·</span>공휴일 <strong>{holidays.length}일</strong></p>
      </header>

      <div className={styles.body}>
        {sortedGroups.length === 0 ? <div className={styles.empty}>
          <span className={styles.emptyIcon}><Icon name="calendar" size={28} /></span>
          <h3>이번 달에 표시할 일정이 없습니다</h3>
          <p>달력에서 날짜를 선택해<br />새 일정을 등록해 보세요.</p>
        </div> : <div className={styles.groups}>
          {sortedGroups.map(([date, group]) => {
            const day = Number(date.slice(-2));
            const weekday = weekdays[Temporal.PlainDate.from(date).dayOfWeek % 7];
            return <section className={styles.dateGroup} key={date}>
              <h3><span>{month}월 {day}일</span><span>{weekday}</span></h3>
              <ul>
                {group.holidays.map(holiday => <li key={holiday.name}>
                  <div className={styles.holidayRow}>
                    <span className={styles.holidayDot} />
                    <span className={styles.content}>{holiday.name}</span>
                    <span className={styles.holidayBadge}>공휴일</span>
                  </div>
                </li>)}
                {group.schedules.map(schedule => <li key={schedule.id}>
                  <button type="button" className={styles.scheduleRow} onClick={() => onSelectDate(day)} aria-label={`${month}월 ${day}일 ${schedule.content} 일정 열기`}>
                    <span className={styles.scheduleDot} />
                    <span className={styles.content}>{schedule.content}</span>
                    <Badge status={schedule.status}>{schedule.status}</Badge>
                    <Icon name="chevron" size={14} />
                  </button>
                </li>)}
              </ul>
            </section>;
          })}
        </div>}
      </div>
      <footer className={styles.footer}>일정을 선택하면 해당 날짜의 상세 내용을 확인할 수 있습니다.</footer>
    </aside>
  );
}
