import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentBody,
  DialogHeader,
  DialogTitle,
} from '../components/Dialog';
import { cn } from '../lib/utils';

type Position = {
  x: number;
  y: number;
};

export interface ManagedDialogProps {
  id: string;
  isOpen?: boolean;
  title?: string;
  description?: string;
  content: React.ComponentType<{ hide?: () => void }>;
  contentProps?: Record<string, unknown>;
  isDraggable?: boolean;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  defaultPosition?: { x: number; y: number };
  onClose?: (id: string) => void;
  unstyled?: boolean;
  showOverlay?: boolean;
  containerClassName?: string;
}

export interface ManagedDialogRef {
  updatePosition: (position: Position) => void;
}

const _updatePosition = (
  contentNode: HTMLElement,
  desiredPosition: { x: number; y: number },
  setCurrentPosition: (pt: Position) => void
) => {
  if (!contentNode) {
    return;
  }

  const boundingClientRect = contentNode.getBoundingClientRect();
  if (boundingClientRect.bottom > window.innerHeight) {
    desiredPosition.y = desiredPosition.y - boundingClientRect.height;
  }
  if (boundingClientRect.right > window.innerWidth) {
    desiredPosition.x = desiredPosition.x - boundingClientRect.width;
  }
  setCurrentPosition(desiredPosition);
};

const ManagedDialog = forwardRef<ManagedDialogRef, ManagedDialogProps>(
  (
    {
      id,
      isOpen,
      title,
      content: DialogContentComponent,
      contentProps,
      isDraggable,
      shouldCloseOnEsc = false,
      shouldCloseOnOverlayClick = false,
      showOverlay = true,
      defaultPosition,
      onClose,
      unstyled,
      containerClassName,
    },
    ref
  ) => {
    const [currentPosition, setCurrentPosition] = useState(defaultPosition);
    const [contentNode, setContentNode] = useState<HTMLElement | null>(null);

    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggable) {
          return;
        }

        const target = e.target as HTMLElement;
        if (!target.closest('.drag-handle') && !target.classList.contains('drag-handle')) {
          return;
        }

        isDragging.current = true;

        if (contentNode) {
          const rect = contentNode.getBoundingClientRect();
          dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };

          if (!currentPosition) {
            setCurrentPosition({ x: rect.left, y: rect.top });
          }
        }
      },
      [isDraggable, contentNode, currentPosition]
    );

    useEffect(() => {
      const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging.current) {
          return;
        }
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // Optional: constrain to window bounds if desired, but typical behavior allows partial drag out
        setCurrentPosition({ x: newX, y: newY });
      };

      const handlePointerUp = () => {
        isDragging.current = false;
      };

      if (isDraggable) {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
      }

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, [isDraggable]);

    useImperativeHandle(
      ref,
      () => ({
        updatePosition: (position: Position) => {
          _updatePosition(contentNode, position, setCurrentPosition);
        },
      }),
      [contentNode]
    );

    useEffect(() => {
      setCurrentPosition(defaultPosition);
    }, [defaultPosition]);

    const [contentVisibility, setContentVisibility] = useState(
      defaultPosition ? 'invisible' : 'visible'
    );

    const contentRef = useCallback(
      contentNode => {
        if (!contentNode) {
          return;
        }

        setContentNode(contentNode);
        _updatePosition(contentNode, defaultPosition, setCurrentPosition);
        setContentVisibility('visible');
      },
      [defaultPosition]
    );

    return (
      <Dialog
        open={isOpen}
        modal={false} // keep modal behavior off for independent windows
        onOpenChange={open => {
          if (!open) {
            onClose(id);
          }
        }}
        isDraggable={false} // We handle dragging manually to override default Dialog translate behaviors
        shouldCloseOnEsc={shouldCloseOnEsc}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        showOverlay={isDraggable ? false : showOverlay}
      >
        <DialogContent
          ref={contentRef}
          onPointerDown={handlePointerDown}
          className={cn(
            unstyled ? 'border-none p-0 shadow-none' : '',
            containerClassName,
            contentVisibility
          )}
          unstyled={unstyled}
          style={{
            ...(currentPosition
              ? {
                  position: 'fixed',
                  left: `${currentPosition.x}px`,
                  top: `${currentPosition.y}px`,
                  transform: 'none',
                  margin: 0,
                  animation: 'none',
                  transition: 'none',
                }
              : {}),
          }}
        >
          {!unstyled && (
            <>
              <DialogHeader>{title && <DialogTitle>{title}</DialogTitle>}</DialogHeader>
              <DialogContentBody>
                <DialogContentComponent
                  {...contentProps}
                  hide={() => onClose(id)}
                />
              </DialogContentBody>
            </>
          )}
          {unstyled && (
            <DialogContentComponent
              {...contentProps}
              hide={() => onClose(id)}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

ManagedDialog.displayName = 'ManagedDialog';

export default ManagedDialog;
