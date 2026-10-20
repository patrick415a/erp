'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import calendarPartsStyles from '@/assets/dashboard/calendar/CalendarParts.module.scss';

import Calendar from '@/components/Calender';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/ui/Icon';
import { Temporal } from '@js-temporal/polyfill';
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [year, setYear] = useState<number>(Temporal.Now.plainDateTimeISO().year);
  const [month, setMonth] = useState<number>(Temporal.Now.plainDateISO().month);

  const current = Temporal.PlainDate.from({
    year,
    month,
    day: 1,
  });

  const prev = current.subtract({ months: 1 });
  const next = current.add({ months: 1 });

  const [prevYear, setPrevYear] = useState<number>(prev.year);
  const [prevMonth, setPrevMonth] = useState<number>(prev.month);

  const [nextYear, setNextYear] = useState<number>(next.year);
  const [nextMonth, setNextMonth] = useState<number>(next.month);

  useEffect(() => {
    setPrevYear(prev.year);
    setPrevMonth(prev.month);

    setNextYear(next.year);
    setNextMonth(next.month);
  }, [year, month]);

  const prevHandler = () => {
    setYear(prev.year);
    setMonth(prev.month);
  };

  const nextHandler = () => {
    setYear(next.year);
    setMonth(next.month);
  };

  return (
    <>
      <Layout>
        <header className={dataViewStyles.pageHeader}>
          <div>
            <h1>일정관리</h1>
          </div>
        </header>
        <div className={calendarPartsStyles.layout}>
          <div className={calendarPartsStyles.box}>
            <Calendar year={prevYear} month={prevMonth} thisMonth={false} />
            <Calendar
              year={year}
              month={month}
              thisMonth
              controls={
                <>
                  <button
                    type="button"
                    onClick={prevHandler}
                    aria-label="이전 달"
                    className={calendarPartsStyles.moveButton}
                  >
                    <Icon name="left" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={nextHandler}
                    aria-label="다음 달"
                    className={calendarPartsStyles.moveButton}
                  >
                    <Icon name="right" size={18} />
                  </button>
                </>
              }
            />
            <Calendar year={nextYear} month={nextMonth} thisMonth={false} />
          </div>
        </div>
      </Layout>
    </>
  );
}
