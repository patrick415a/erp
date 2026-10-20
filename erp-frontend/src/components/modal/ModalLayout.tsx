'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Icon } from '@/components/ui/Icon';

import React from 'react';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ModalLayout({ isOpen, onClose, title, children }: ModalLayoutProps) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className={modalPartsStyles.overlay}>
      <div onClick={(e) => e.stopPropagation()} className={modalPartsStyles.container}>
        <div className={modalPartsStyles.header}>
          <h3 className={modalPartsStyles.title}>{title}</h3>
          <button onClick={onClose} aria-label="닫기" className={buttonStyles.closeButton}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className={modalPartsStyles.body}>{children}</div>
      </div>
    </div>
  );
}
