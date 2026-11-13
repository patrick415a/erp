'use client';

import modalPartsStyles from '@/assets/modal/ModalParts.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';
import { Icon } from '@/components/ui/Icon';

import { useEffect, useId, useRef, useState } from 'react';

export interface AlertNotice {
  message: string;
  status?: 'success' | 'error' | null;
}

interface AlertModalProps extends AlertNotice {
  isOpen: boolean;
  onClose: () => void;
}

function AlertDialog({ message, status, onClose }: Omit<AlertModalProps, 'isOpen'>) {
  const [isClosing, setIsClosing] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const messageId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement;
    confirmRef.current?.focus();
    return () => {
      window.clearTimeout(closeTimer.current);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const handleClose = () => {
    if (closeTimer.current !== undefined) return;
    setIsClosing(true);
    closeTimer.current = window.setTimeout(onClose, 300);
  };

  return (
    <div className={modalPartsStyles.overlay}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={status === 'success' ? '성공' : status === 'error' ? '실패' : '알림'}
        aria-describedby={messageId}
        data-closing={isClosing || undefined}
        className={modalPartsStyles.alert}
      >
        {status && (
          <div className={modalPartsStyles.alertIcon} data-status={status}>
            <Icon name={status === 'success' ? 'checkMark' : 'warningTriangle'} size={32} />
          </div>
        )}
        <p id={messageId} className={modalPartsStyles.text}>{message.replaceAll('\\n', '\n')}</p>
        <button
          type="button"
          ref={confirmRef}
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
}

export default function AlertModal({ isOpen, ...props }: AlertModalProps) {
  return isOpen ? <AlertDialog {...props} /> : null;
}
