import type { ComponentProps } from 'react';
import styles from './CalendarParts.module.scss';

export function CalendarLayout({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.layout} ${className}`} />
  );
}

export function CalendarBox({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.box} ${className}`} />
  );
}

export function CalTopMargin({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.topMargin} ${className}`} />
  );
}

export function CalendarWrapper({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.wrapper} ${className}`} />
  );
}

export function CalHeader({ className = '', ...props }: ComponentProps<'h2'>) {
  return (
    <h2 {...props} className={`${styles.header} ${className}`} />
  );
}

export function CalendarToolbar({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.toolbar} ${className}`} />
  );
}

export function CalendarNavigation({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.navigation} ${className}`} />
  );
}

export function Grid({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.grid} ${className}`} />
  );
}

export function DayName({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.dayName} ${className}`} />
  );
}

export function Tooltip({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.tooltip} ${className}`} />
  );
}

export function MoveMonthBtn({ className = '', ...props }: ComponentProps<'button'>) {
  return (
    <button {...props} className={`${styles.moveButton} ${className}`} />
  );
}

export function Calendar({ thismonth, className = '', ...props }: ComponentProps<'div'> & { thismonth: boolean; }) {
  return (
    <div {...props} data-current={thismonth} className={`${styles.calendar} ${className}`} />
  );
}
export function DayCell({ isEmpty, isToday, isHoliday, isSunday, isSaturday, className = '', ...props }: ComponentProps<'div'> & { isEmpty?: boolean; isToday?: boolean; isHoliday?: boolean; isSunday?: boolean; isSaturday?: boolean; }) {
  return (
    <div 
      {...props} 
      data-empty={isEmpty || undefined} 
      data-today={isToday || undefined} 
      data-holiday={isHoliday || isSunday || undefined} 
      data-saturday={isSaturday || undefined} 
      className={`${styles.dayCell} ${className}`} 
    />
  );
}
