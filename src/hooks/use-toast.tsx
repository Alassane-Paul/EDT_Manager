import { toast as toastify } from "react-toastify";
import * as React from "react";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: React.ReactNode; // Keep for compatibility, though maybe unused
  [key: string]: any; // Catch-all for other props
}

function toast({ title, description, variant, action, ...props }: ToastProps) {
  const content = (
    <div>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm">{description}</div>}
    </div>
  );

  const options = {
    ...props
  };

  if (variant === "destructive") {
    return toastify.error(content, options);
  }
  return toastify.success(content, options);
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string) => toastify.dismiss(id),
    toasts: [] // Mock to prevent breaking if referenced, though unused
  };
}

export { useToast, toast };
