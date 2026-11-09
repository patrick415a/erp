import buttonStyles from '@/assets/common/Button.module.scss';
import modalStyles from '@/assets/modal/ModalParts.module.scss';
import ModalLayout from './ModalLayout';

interface DeleteConfirmModalProps {
  message: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  message,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const cancel = () => {
    if (!isDeleting) onClose();
  };

  return (
    <ModalLayout isOpen title="삭제 확인" onClose={cancel}>
      <div aria-busy={isDeleting}>
        <p className={modalStyles.text} data-align="left">{message}</p>
        <div className={modalStyles.actions}>
          <button
            type="button"
            className={buttonStyles.button}
            data-variant="outline"
            onClick={cancel}
            disabled={isDeleting}
            autoFocus
          >
            취소
          </button>
          <button
            type="button"
            className={buttonStyles.button}
            data-variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중…' : '삭제'}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
}
