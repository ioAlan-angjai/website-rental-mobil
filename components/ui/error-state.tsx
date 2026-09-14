import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ElementType;
  className?: string;
  variant?: 'default' | 'inline' | 'fullpage';
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  description = 'Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.',
  onRetry,
  retryLabel = 'Coba Lagi',
  icon: Icon = AlertTriangle,
  className,
  variant = 'default',
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm",
        className
      )}>
        <Icon className="size-5 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-red-800">{title}</p>
          {description && <p className="text-red-600 text-xs mt-0.5">{description}</p>}
        </div>
        {onRetry && (
          <Button
            variant="destructive-outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0"
          >
            <RefreshCw className="size-3.5 mr-1" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'fullpage') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] text-center px-6",
        className
      )}>
        <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-6">
          <Icon className="size-9 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">{description}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="size-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5">
        <Icon className="size-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorState
      icon={WifiOff}
      title="Koneksi Terputus"
      description="Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
      onRetry={onRetry}
      className={className}
    />
  );
}
