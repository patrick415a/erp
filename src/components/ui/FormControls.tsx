import type { ComponentProps, ReactNode } from 'react';
import styles from './FormControls.module.scss';

// 라벨·필수 표시만 담당합니다. 입력 상태와 유효성 검사는 각 페이지에서 유지합니다.
export function FormField({ label, required, children, className = '', htmlFor }: {
  label: string; required?: boolean; children: ReactNode; className?: string; htmlFor?: string;
}) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label className={styles.label} htmlFor={htmlFor}>{label}{required && <span className={styles.required}> *</span>}</label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input {...props} className={`${styles.input} ${className}`} />
  );
}

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea {...props} className={`${styles.textarea} ${className}`} />
  );
}

export function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return (
    <select {...props} className={`${styles.input} ${className}`} />
  );
}

export function Label({ className = '', ...props }: ComponentProps<'label'>) {
  return (
    <label {...props} className={`${styles.label} ${className}`} />
  );
}

export function RadioLabel({ className = '', ...props }: ComponentProps<'label'>) {
  return (
    <label {...props} className={`${styles.radioLabel} ${className}`} />
  );
}

export function CheckboxLabel({ className = '', ...props }: ComponentProps<'label'>) {
  return (
    <label {...props} className={`${styles.checkboxLabel} ${className}`} />
  );
}

export function SelectItem({ isSelected, className = '', ...props }: ComponentProps<'li'> & { isSelected?: boolean; }) {
  return (
    <li {...props} data-selected={isSelected || undefined} className={`${styles.selectItem} ${className}`} />
  );
}

export function CustomSelectContainer({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.selectContainer} ${className}`} />
  );
}

export function SelectTrigger({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.selectTrigger} ${className}`} />
  );
}

export function SelectList({ className = '', ...props }: ComponentProps<'ul'>) {
  return (
    <ul {...props} className={`${styles.selectList} ${className}`} />
  );
}
