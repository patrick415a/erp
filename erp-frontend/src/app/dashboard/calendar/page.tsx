'use client';

import dataViewStyles from '@/assets/common/DataView.module.scss';
import calendarPartsStyles from '@/assets/dashboard/calendar/CalendarParts.module.scss';
import Calendar from '@/components/Calender';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/ui/Icon';
import { Temporal } from '@js-temporal/polyfill';
import { useState } from 'react';

function currentMonth() {
  return Temporal.Now.plainDateISO().toPlainYearMonth();
}

export default function CalendarPage() {
  const [month, setMonth] = useState(currentMonth);

  return (
    <Layout>
      <header className={dataViewStyles.pageHeader}>
        <div>
          <h1>일정관리</h1>
        </div>
      </header>
      <div className={calendarPartsStyles.layout}>
        <div className={calendarPartsStyles.box}>
          <Calendar
            year={month.year}
            month={month.month}
            thisMonth
            controls={
              <>
                <button
                  type="button"
                  onClick={() => setMonth((current) => current.subtract({ months: 1 }))}
                  aria-label="이전 달"
                  className={calendarPartsStyles.moveButton}
                >
                  <Icon name="left" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setMonth(currentMonth())}
                  aria-label="오늘로 이동"
                  className={calendarPartsStyles.moveButton}
                  data-today
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => setMonth((current) => current.add({ months: 1 }))}
                  aria-label="다음 달"
                  className={calendarPartsStyles.moveButton}
                >
                  <Icon name="right" size={18} />
                </button>
              </>
            }
          />
        </div>
      </div>
    </Layout>
  );
}
