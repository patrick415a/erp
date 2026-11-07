'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Icon } from '@/components/ui/Icon';

import { useId, type ReactNode } from 'react';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function ModalLayout({ isOpen, onClose, title, children }: ModalLayoutProps) {
  const titleId = useId();
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className={modalPartsStyles.overlay}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={modalPartsStyles.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={modalPartsStyles.header}>
          <h3 id={titleId} className={modalPartsStyles.title}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={buttonStyles.closeButton}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className={modalPartsStyles.body}>{children}</div>
      </div>
    </div>
  );
}
