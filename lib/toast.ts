import { toast as sonnerToast } from 'sonner';
import { ApiError } from './error-handler';

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
    });
  },

  error: (error: ApiError | string, options?: ToastOptions) => {
    const message = typeof error === 'string' ? error : error.userMessage;
    sonnerToast.error(message, {
      duration: options?.duration || 6000,
      dismissible: options?.dismissible !== false,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
    });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  custom: (component: React.ReactNode, options?: ToastOptions) => {
    sonnerToast.custom(component, {
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
    });
  },
};

export function handleError(error: unknown, context?: string): void {
  if (typeof error === 'string') {
    toast.error(error);
    return;
  }

  if (error && typeof error === 'object' && 'userMessage' in error) {
    toast.error(error as ApiError);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error('Terjadi kesalahan yang tidak diketahui');
}
