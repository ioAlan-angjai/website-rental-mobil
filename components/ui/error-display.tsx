import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { ApiError } from '@/lib/error-handler';
import { Button } from './button';

interface ErrorDisplayProps {
  error: ApiError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '',
  compact = false 
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorObj: ApiError = typeof error === 'string' 
    ? {
        code: 'UNKNOWN',
        message: error,
        userMessage: error,
        severity: 'error',
        statusCode: 500,
        timestamp: new Date(),
      }
    : error;

  const severityConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-800 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-red-100 dark:bg-red-950/50',
      borderColor: 'border-red-300 dark:border-red-700',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-700 dark:text-red-300',
    },
  };

  const config = severityConfig[errorObj.severity];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg ${className}`}>
        <Icon size={16} className={`${config.iconColor} shrink-0`} />
        <p className={`text-xs ${config.textColor} flex-1`}>{errorObj.userMessage}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${config.iconColor} hover:opacity-70 transition-opacity`}
            aria-label="Tutup"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold ${config.textColor} mb-1`}>
            {errorObj.severity === 'critical' ? 'Kesalahan Kritis' : 
             errorObj.severity === 'error' ? 'Terjadi Kesalahan' : 
             errorObj.severity === 'warning' ? 'Peringatan' : 'Informasi'}
          </h3>
          <p className={`text-xs ${config.textColor} leading-relaxed`}>
            {errorObj.userMessage}
          </p>
          {process.env.NODE_ENV === 'development' && errorObj.details && (
            <details className="mt-2">
              <summary className={`text-xs ${config.textColor} cursor-pointer font-mono`}>
                Detail Error (Development)
              </summary>
              <pre className={`text-[10px] ${config.textColor} mt-1 font-mono overflow-auto p-2 bg-background/50 rounded`}>
                {JSON.stringify(errorObj.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw size={12} />
              Coba Lagi
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`${config.iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
          Aplikasi mengalami kesalahan yang tidak terduga. Silakan muat ulang halaman atau hubungi support jika masalah berlanjut.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-xs text-foreground/70 cursor-pointer font-mono mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-[10px] text-foreground/60 bg-secondary p-3 rounded overflow-auto max-h-40">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={resetErrorBoundary} className="gap-2">
            <RefreshCw size={14} />
            Muat Ulang
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
