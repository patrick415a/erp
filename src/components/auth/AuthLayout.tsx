import type { ReactNode } from 'react';
import { Brand } from '../Brand';
import styles from './AuthLayout.module.scss';

export function AuthLayout({ children, title, description, wide = false }: {
  children: ReactNode; title: string; description: string; wide?: boolean;
}) {
  return (
    <main className={`${styles.page} ${wide ? styles.wide : ''}`}>
      <div className={styles.brand}><Brand /></div>
      <section className={styles.card}>
        <header className={styles.heading}><h1>{title}</h1><p>{description}</p></header>
        {children}
      </section>
      <footer className={styles.copyright}>© Production Management System. All rights reserved.</footer>
    </main>
  );
}
