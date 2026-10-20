"use client";

import Calendar from "@/components/Calender";
import { Layout } from "@/components/Layout";
import * as UI from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/DataView';
import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

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
        <PageHeader title="일정관리" />
        <UI.CalendarLayout>
          <UI.CalendarBox>
            <Calendar year={prevYear} month={prevMonth} thisMonth={false} />
            <Calendar year={year} month={month} thisMonth={true} controls={<>
              <UI.MoveMonthBtn type="button" onClick={prevHandler} aria-label="이전 달"><Icon name="left" size={18} /></UI.MoveMonthBtn>
              <UI.MoveMonthBtn type="button" onClick={nextHandler} aria-label="다음 달"><Icon name="right" size={18} /></UI.MoveMonthBtn>
            </>} />
            <Calendar year={nextYear} month={nextMonth} thisMonth={false} />
          </UI.CalendarBox>
        </UI.CalendarLayout>
      </Layout>
    </>
  );
}
