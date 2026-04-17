import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import { cn } from '../../lib/utils';
import { useDraggable } from './useDraggable';

interface DialogContextValue {
  isDraggable?: boolean;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  showOverlay?: boolean;
}

const DialogContext = React.createContext<DialogContextValue>({
  isDraggable: false,
  shouldCloseOnEsc: true,
  shouldCloseOnOverlayClick: true,
});

interface DialogRootProps extends DialogPrimitive.DialogProps {
  isDraggable?: boolean;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnOverlayClick?: boolean;
  showOverlay?: boolean;
}

const Dialog = ({
  isDraggable,
  shouldCloseOnEsc = true,
  shouldCloseOnOverlayClick = true,
  showOverlay = true,
  ...props
}: DialogRootProps) => (
  <DialogContext.Provider
    value={{ isDraggable, shouldCloseOnEsc, shouldCloseOnOverlayClick, showOverlay }}
  >
    <DialogPrimitive.Root {...props} />
  </DialogContext.Provider>
);

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[1050] bg-black/40 backdrop-blur-md',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  unstyled?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps & {
    children?: React.ReactNode;
  }
>(({ className, children, unstyled, ...props }, ref) => {
  const { isDraggable, shouldCloseOnEsc, shouldCloseOnOverlayClick, showOverlay } =
    React.useContext(DialogContext);

  const { handlePointerDown, setRefs, initialTransform } = useDraggable(
    {
      enabled: isDraggable,
    },
    ref
  );

  // Premium Glassmorphic Dialog
  const contentClassName = cn(
    unstyled ? '' : 'w-full overflow-hidden',
    'bg-[#0c1222]/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-[1100] flex flex-col gap-0 shadow-2xl duration-200 sm:rounded-3xl max-h-[90vh]',
    !isDraggable ? 'translate-x-[-50%] translate-y-[-50%]' : '',
    !className?.includes('max-w-') ? 'max-w-md' : '',
    className
  );

  const style = isDraggable ? { ...props.style, transform: initialTransform } : props.style;

  const content = (
    <DialogPrimitive.Content
      ref={setRefs}
      className={contentClassName}
      {...props}
      style={style}
      aria-describedby={props['aria-describedby'] || undefined}
      onPointerDown={isDraggable ? handlePointerDown : props.onPointerDown}
      onEscapeKeyDown={event => {
        if (!shouldCloseOnEsc) {
          event.preventDefault();
        }
      }}
      onInteractOutside={event => {
        if (!shouldCloseOnOverlayClick) {
          event.preventDefault();
        }
      }}
    >
      {children}
      {!unstyled && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-all hover:bg-white/10 hover:text-white focus:outline-none">
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  );

  return (
    <DialogPortal>
      {showOverlay && !isDraggable && <DialogOverlay />}
      {content}
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'drag-handle relative flex select-none flex-col space-y-2 p-6 pb-2 text-center sm:text-left',
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
};
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-2xl font-bold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-white/50', className)}
    {...props}
  />
));

const DialogContentBody = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={cn('flex-1 overflow-y-auto px-6 pb-6 pt-2', className)}>{children}</div>;
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogContentBody,
};
