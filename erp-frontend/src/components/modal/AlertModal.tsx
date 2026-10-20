'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

import { useEffect, useState, useRef } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const AlertModal = ({ isOpen, message, onClose }: AlertModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      modalRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        e.key === 'Enter' ? handleClose() : false;
      }}
      className={modalPartsStyles.overlay}
    >
      <div data-closing={isClosing || undefined} className={modalPartsStyles.alert}>
        <p className={modalPartsStyles.text}>{message.replaceAll('\\n', '\n')}</p>
        <button
          onClick={handleClose}
          data-variant="white"
          data-size="medium"
          data-full-width={true}
          className={buttonStyles.button}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
