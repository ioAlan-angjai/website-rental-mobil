import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/* ═══ Spinner ═══ */
interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'default', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    default: 'size-6',
    lg: 'size-8',
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-warm-500", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

/* ═══ Full-page loading ═══ */
interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({ text = 'Memuat...', className }: LoadingPageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] gap-4", className)}>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/* ═══ Card skeleton ═══ */
interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ═══ Table skeleton ═══ */
interface LoadingTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, cols = 4, className }: LoadingTableProps) {
  return (
    <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-warm-50 border-b border-border p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="p-4 flex gap-4 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
