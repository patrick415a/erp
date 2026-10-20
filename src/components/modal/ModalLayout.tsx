"use client";

import * as UI from '@/components/ui';
import React from "react";

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ModalLayout({ isOpen, onClose, title, children }: ModalLayoutProps) {

  if (!isOpen) return null;

  return (
    <UI.ModalOverlay onClick={onClose}>
      <UI.ModalContainer onClick={(e) => e.stopPropagation()}>
        <UI.ModalHeader>
          <UI.ModalTitle>{title}</UI.ModalTitle>
          <UI.CloseButton onClick={onClose} />
        </UI.ModalHeader>
        <UI.ModalBody>
          {children}
        </UI.ModalBody>
      </UI.ModalContainer>
    </UI.ModalOverlay>
  );
}
