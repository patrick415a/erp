'use client';

import * as UI from '@/components/ui';
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
    <UI.ModalOverlay ref={modalRef} tabIndex={-1} onKeyDown={(e) => {e.key === 'Enter' ? handleClose() : false}}>
      <UI.ModalBox isClosing={isClosing}>
        <UI.ModalText>
          {message.replaceAll('\\n', '\n')}
        </UI.ModalText>
        <UI.Button
          variant="white"
          size="medium"
          onClick={handleClose}
          fullWidth
        >확인</UI.Button>
      </UI.ModalBox>
    </UI.ModalOverlay>
  );
};

export default AlertModal;