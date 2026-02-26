import React from 'react';
import { Dialog, DialogContent, DialogContentBody, DialogHeader, DialogTitle } from '../Dialog';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentClassName?: string;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  contentClassName,
  shouldCloseOnEsc = true,
  shouldCloseOnOverlayClick = true,
  containerClassName,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <DialogContent className={containerClassName}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <DialogContentBody className={contentClassName}>{children}</DialogContentBody>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
