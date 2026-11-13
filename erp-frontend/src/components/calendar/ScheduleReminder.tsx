'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import buttonStyles from '@/assets/common/Button.module.scss';
import styles from '@/assets/dashboard/calendar/ScheduleReminder.module.scss';
import { Icon } from '@/components/ui/Icon';
import { setSchedules } from './scheduleStorage';
import type { Schedule } from '@/app/types/schedule';
import { useAccess } from '@/store/access';

function ActiveScheduleReminder() {
  const [notices, setNotices] = useState<Schedule[]>([]);

  useEffect(() => {
    let audio: AudioContext | undefined;
    const enableAudio = () => {
      if (!window.AudioContext) return;
      try {
        audio ??= new AudioContext();
        if (audio.state === 'suspended') void audio.resume().catch(() => {});
      } catch {
        // The visual reminder is available even if the browser blocks audio.
      }
    };

    const check = () => {
      const now = Temporal.Now.plainDateTimeISO().toString({ smallestUnit: 'minute' });
      const due: Schedule[] = [];

      setSchedules((current) => {
        const next = current.map((schedule) => {
          if (
            !schedule.time ||
            schedule.date + 'T' + schedule.time !== now ||
            schedule.status === '완료' ||
            schedule.notifiedFor === now
          )
            return schedule;
          due.push(schedule);
          return { ...schedule, notifiedFor: now };
        });
        return due.length ? next : current;
      });
      if (!due.length) return;

      const dueIds = new Set(due.map((schedule) => schedule.id));
      setNotices((current) => [
        ...current.filter((schedule) => !dueIds.has(schedule.id)),
        ...due,
      ]);
      if (audio?.state === 'running') {
        const tone = audio.createOscillator();
        const volume = audio.createGain();
        const start = audio.currentTime;
        tone.frequency.value = 740;
        volume.gain.setValueAtTime(0.14, start);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        tone.connect(volume).connect(audio.destination);
        tone.start(start);
        tone.stop(start + 0.45);
      }
    };

    window.addEventListener('pointerdown', enableAudio);
    window.addEventListener('keydown', enableAudio);
    window.addEventListener('focus', check);
    const start = window.setTimeout(check, 0);
    const interval = window.setInterval(check, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.removeEventListener('focus', check);
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('keydown', enableAudio);
      if (audio && audio.state !== 'closed') void audio.close().catch(() => {});
    };
  }, []);

  return (
    <div className={notices.length ? styles.toast : undefined}>
      <div role="status" className={styles.content}>
        {notices.length > 0 && (
          <>
            <strong>업무 일정 알림</strong>
            <ul className={styles.notices}>
              {notices.map((schedule) => (
                <li key={schedule.id}>
                  <time dateTime={schedule.time}>{schedule.time}</time> · {schedule.title || schedule.content}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {notices.length > 0 && (
        <button
          type="button"
          aria-label="일정 알림 닫기"
          className={buttonStyles.closeButton}
          onClick={() => setNotices([])}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}

export function ScheduleReminder() {
  const pathname = usePathname();
  const { can } = useAccess();
  return can('CALENDAR_VIEW') && (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) ? (
    <ActiveScheduleReminder />
  ) : null;
}
