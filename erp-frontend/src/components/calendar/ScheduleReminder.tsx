'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import AlertModal from '@/components/modal/AlertModal';
import { setSchedules } from './scheduleStorage';
import type { Schedule } from '@/app/types/schedule';

function ActiveScheduleReminder() {
  const [notices, setNotices] = useState<string[]>([]);

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

      setNotices((current) => [
        ...current,
        ...due.map((schedule) => schedule.time + ' · ' + (schedule.title || schedule.content)),
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
    <AlertModal
      isOpen={notices.length > 0}
      message={notices.length ? '업무 일정 알림\n' + notices.join('\n') : ''}
      onClose={() => setNotices([])}
    />
  );
}

export function ScheduleReminder() {
  const pathname = usePathname();
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') ? (
    <ActiveScheduleReminder />
  ) : null;
}
