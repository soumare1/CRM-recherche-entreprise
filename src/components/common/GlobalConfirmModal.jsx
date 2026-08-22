import { useUIStore } from '../../stores/uiStore';
import ConfirmModal from './ConfirmModal';

export default function GlobalConfirmModal() {
  const confirmModal = useUIStore((state) => state.confirmModal);
  const closeConfirmModal = useUIStore((state) => state.closeConfirmModal);

  if (!confirmModal) return null;

  return (
    <ConfirmModal
      isOpen={!!confirmModal}
      onClose={closeConfirmModal}
      onConfirm={confirmModal.onConfirm}
      title={confirmModal.title}
      message={confirmModal.message}
      confirmText={confirmModal.confirmText}
      cancelText={confirmModal.cancelText}
      variant={confirmModal.variant || 'danger'}
    />
  );
}
