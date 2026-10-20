import type { ComponentProps } from 'react';
import styles from './Content.module.scss';

export function TitleStart({ className = '', ...props }: ComponentProps<'h1'>) {
  return (
    <h1 {...props} className={`${styles.title} ${className}`} />
  );
}
export function Mt1({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.fieldSpacing} ${className}`} />  
  );
}
