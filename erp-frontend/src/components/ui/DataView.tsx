import type { ComponentProps, ReactNode } from 'react';
import styles from './DataView.module.scss';
import { Icon, type IconName } from './Icon';

// 목록 화면에서 반복되는 제목·요약 카드·표의 틀입니다. 데이터 처리는 각 페이지에 둡니다.
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode; }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className={styles.pageActions}>
        {children}
      </div>}
    </header>
  );
}

export function StatsGrid({ children }: { children: ReactNode; }) { 
  return (
    <div className={styles.statsGrid}>
      {children}
    </div>
  ); 
}

export function StatCard({ label, value, tone = 'default', icon = 'chart' }: { label: string; value: ReactNode; tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'; icon?: IconName; }) {
  return (
    <section className={styles.statCard} data-tone={tone}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
      <span className={styles.statDecoration}><Icon name={icon} size={19} /></span>
    </section>
  );
}
export function DataPanel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode; }) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h2>{title}</h2>
        {actions && <div className={styles.panelActions}>{actions}</div>}
      </header>{children}
    </section>
  );
}

export function DataTable({ className = '', ...props }: ComponentProps<'table'>) {
  return (
    <div className={styles.tableScroller}>
      <table {...props} className={`${styles.table} ${className}`} />
    </div>
  );
}

export function StatusBadge({ tone = 'secondary', className = '', ...props }: ComponentProps<'span'> & { tone?: 'success' | 'warning' | 'danger' | 'secondary' | 'primary'; }) {
  return (
    <span {...props} data-tone={tone} className={`${styles.badge} ${className}`} />
  );
}
