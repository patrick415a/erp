import buttons from '@/assets/common/Button.module.scss';
import styles from '@/assets/common/DataView.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, label }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label={label}>
      <button
        type="button"
        className={buttons.button}
        data-variant="outline"
        data-size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const isCurrent = currentPage === page;
        return (
          <button
            key={page}
            type="button"
            className={`${buttons.button} ${styles.pageNumber}`}
            data-variant={isCurrent ? undefined : 'outline'}
            data-size="small"
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`${page} 페이지`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        className={buttons.button}
        data-variant="outline"
        data-size="small"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
      </button>
    </nav>
  );
}
