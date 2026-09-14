import { cn } from '@/lib/utils';
import { Package, Search, FileX, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-warm-100 border border-warm-300 flex items-center justify-center mb-5">
        <Icon className="size-7 text-warm-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* Preset empty states */
export function EmptySearch({ onReset, className }: { onReset?: () => void; className?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Tidak ada hasil"
      description="Coba ubah kata kunci pencarian atau hapus filter yang aktif."
      action={onReset ? { label: 'Reset Filter', onClick: onReset, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

export function EmptyBookings({ onBook, className }: { onBook?: () => void; className?: string }) {
  return (
    <EmptyState
      icon={Calendar}
      title="Belum ada booking"
      description="Anda belum memiliki riwayat booking. Mulai booking mobil sekarang!"
      action={onBook ? { label: 'Booking Sekarang', onClick: onBook } : undefined}
      className={className}
    />
  );
}

export function EmptyData({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FileX}
      title="Data tidak tersedia"
      description="Belum ada data yang dapat ditampilkan."
      className={className}
    />
  );
}
