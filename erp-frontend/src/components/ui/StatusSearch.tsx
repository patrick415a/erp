import type { FormEvent } from 'react';
import forms from '@/assets/common/FormControls.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';

interface StatusSearchProps {
  keywordLabel: string;
  statusLabel: string;
  statuses: Readonly<Record<string, { label: string }>>;
  onSearch: (keyword: string, status: string) => void;
}

export function StatusSearch({ keywordLabel, statusLabel, statuses, onSearch }: StatusSearchProps) {
  function handleChange(event: FormEvent<HTMLFormElement>) {
    const fields = new FormData(event.currentTarget);
    onSearch(String(fields.get('keyword')).trim().toLowerCase(), String(fields.get('status')));
  }

  return (
    <form className={view.search} onChange={handleChange} onSubmit={(event) => event.preventDefault()}>
      <input
        type="search"
        name="keyword"
        className={forms.input}
        aria-label={keywordLabel}
        placeholder={`${keywordLabel}...`}
      />
      <select name="status" className={forms.input} aria-label={statusLabel} defaultValue="">
        <option value="">전체</option>
        {Object.entries(statuses).map(([value, { label }]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </form>
  );
}
