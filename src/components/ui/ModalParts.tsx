import type { ComponentProps } from 'react';
import styles from './ModalParts.module.scss';

export function ModalOverlay({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.overlay} ${className}`} />
  );
}

export function ModalHeader({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.header} ${className}`} />
  );
}

export function ModalTitle({ className = '', ...props }: ComponentProps<'h3'>) {
  return (
    <h3 {...props} className={`${styles.title} ${className}`} />
  );
}

export function ModalBody({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.body} ${className}`} />
  );
}

export function ModalText({ className = '', ...props }: ComponentProps<'p'>) {
  return (
    <p {...props} className={`${styles.text} ${className}`} />
  );
}

export function FormGroup({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.formGroup} ${className}`} />
  );
}

export function ButtonGroup({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.actions} ${className}`} />
  );
}

export function ScheduleList({ className = '', ...props }: ComponentProps<'ul'>) {
  return (
    <ul {...props} className={`${styles.scheduleList} ${className}`} />
  );
}

export function ScheduleItem({ className = '', ...props }: ComponentProps<'li'>) {
  return (
    <li {...props} className={`${styles.scheduleItem} ${className}`} />
  );
}

export function ScheduleHeader({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.scheduleHeader} ${className}`} />
  );
}

export function ScheduleDot({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.scheduleDot} ${className}`} />
  );
}

export function ModalContainer({ isClosing, className = '', ...props }: ComponentProps<'div'> & { isClosing?: boolean; }) {
  return (
    <div {...props} data-closing={isClosing || undefined} className={`${styles.container} ${className}`} />
  );
}

export function ModalBox({ isClosing, className = '', ...props }: ComponentProps<'div'> & { isClosing?: boolean; }) {
  return (
    <div {...props} data-closing={isClosing || undefined} className={`${styles.alert} ${className}`} />
  );
}

export function Badge({ status, className = '', ...props }: ComponentProps<'span'> & { status: '대기' | '진행' | '완료'; }) {
  return (
    <span {...props} data-status={status} className={`${styles.badge} ${className}`} />
  );
}
