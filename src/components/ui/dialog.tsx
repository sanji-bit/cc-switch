import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    zIndex?: "base" | "nested" | "alert" | "top";
  }
>(({ className, zIndex = "base", ...props }, ref) => {
  const zIndexMap = {
    base: "z-40",
    nested: "z-50",
    alert: "z-[60]",
    top: "z-[110]",
  };

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 bg-black/38 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        zIndexMap[zIndex],
        className,
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogZIndex = "base" | "nested" | "alert" | "top";
type DialogVariant = "default" | "form" | "confirm" | "wizard" | "fullscreen";

const dialogZIndexMap: Record<DialogZIndex, string> = {
  base: "z-40",
  nested: "z-50",
  alert: "z-[60]",
  top: "z-[110]",
};

const dialogVariantClass: Record<DialogVariant, string> = {
  default:
    "fixed left-1/2 top-1/2 flex w-full max-w-xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-border/80 bg-background text-foreground shadow-2xl shadow-black/12 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[calc(100vh-2rem)] rounded-[26px] sm:max-h-[calc(100vh-3rem)]",
  form:
    "fixed left-1/2 top-1/2 flex w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-border/80 bg-background text-foreground shadow-2xl shadow-black/14 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[calc(100vh-2rem)] rounded-[28px] sm:max-h-[calc(100vh-3rem)]",
  confirm:
    "fixed left-1/2 top-1/2 flex w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-border/80 bg-background text-foreground shadow-2xl shadow-black/14 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[calc(100vh-2rem)] rounded-[24px] sm:max-h-[calc(100vh-3rem)]",
  wizard:
    "fixed left-1/2 top-1/2 flex w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-border/80 bg-background text-foreground shadow-2xl shadow-black/14 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[calc(100vh-2rem)] rounded-[28px] sm:max-h-[calc(100vh-3rem)]",
  fullscreen:
    "fixed inset-0 flex h-screen w-screen translate-x-0 translate-y-0 flex-col bg-background text-foreground p-0 shadow-none sm:rounded-none",
};

const DialogSurface = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    zIndex?: DialogZIndex;
    variant?: DialogVariant;
    overlayClassName?: string;
    closeOnOverlayClick?: boolean;
  }
>(
  (
    {
      className,
      children,
      zIndex = "base",
      variant = "default",
      overlayClassName,
      closeOnOverlayClick = false,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay zIndex={zIndex} className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogVariantClass[variant], dialogZIndexMap[zIndex], className)}
        onInteractOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogSurface.displayName = DialogPrimitive.Content.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    zIndex?: DialogZIndex;
    variant?: DialogVariant;
    overlayClassName?: string;
    closeOnOverlayClick?: boolean;
  }
>(({ variant = "default", ...props }, ref) => (
  <DialogSurface ref={ref} variant={variant} {...props} />
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2 px-6 py-5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 min-h-0 overflow-y-auto p-6", className)}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children ?? <X className="h-4 w-4" />}
  </DialogPrimitive.Close>
));
DialogCloseButton.displayName = "DialogCloseButton";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogSurface,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogCloseButton,
};
