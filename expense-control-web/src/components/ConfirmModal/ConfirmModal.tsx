// Modal de confirmação para ações destrutivas
import React from "react";

interface ConfirmModalProps {
  message: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  visible,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-icon">!</div>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button button-delete" onClick={onConfirm}>
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
};
