import { useSyncExternalStore } from 'react';
import type { Schedule } from '@/app/types/schedule';

const key = 'erp-schedules';
const empty: Schedule[] = [];
const listeners = new Set<() => void>();
let snapshot = empty;
let lastValue: string | null;
let memoryOnly = false;

function isSchedule(value: unknown): value is Schedule {
  if (!value || typeof value !== 'object') return false;
  const schedule = value as Partial<Schedule>;
  if (typeof schedule.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(schedule.date)) return false;
  const date = new Date(schedule.date);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== schedule.date)
    return false;
  return (
    typeof schedule.id === 'string' &&
    typeof schedule.content === 'string' &&
    typeof schedule.createdAt === 'string' &&
    (schedule.title === undefined || typeof schedule.title === 'string') &&
    (schedule.time === undefined ||
      (typeof schedule.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(schedule.time))) &&
    (schedule.status === '대기' || schedule.status === '진행' || schedule.status === '완료')
  );
}

export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined' || memoryOnly) return snapshot;
  try {
    const value = localStorage.getItem(key);
    if (value === lastValue) return snapshot;
    lastValue = value;
    const data: unknown = value ? JSON.parse(value) : null;
    snapshot = Array.isArray(data) ? data.filter(isSchedule) : empty;
  } catch {
    snapshot = empty;
  }
  return snapshot;
}

export function setSchedules(update: (current: Schedule[]) => Schedule[]) {
  const current = getSchedules();
  const next = update(current);
  if (next === current) return;
  snapshot = next;
  lastValue = JSON.stringify(next);
  try {
    localStorage.setItem(key, lastValue);
  } catch {
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useSchedules() {
  return useSyncExternalStore(subscribe, getSchedules, () => empty);
}
