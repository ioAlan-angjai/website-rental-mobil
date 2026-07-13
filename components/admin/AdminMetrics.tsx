'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Car, Clock } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'sky' | 'emerald' | 'amber' | 'rose';
  delay?: number;
}

function MetricCard({ title, value, icon, trend, color, delay = 0 }: MetricCardProps) {
  const colorMap = {
    sky: { bg: 'from-sky-500/10 to-sky-500/5', border: 'border-sky-400/20', icon: 'text-sky-400' },
    emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-400/20', icon: 'text-emerald-400' },
    amber: { bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-400/20', icon: 'text-amber-400' },
    rose: { bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-400/20', icon: 'text-rose-400' },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-sm hover:border-opacity-50 transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-slate-800/50 ${colors.icon}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
            <TrendingUp size={16} />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-black text-white">{value}</p>
    </motion.div>
  );
}

export function AdminMetrics() {
  const metrics = [
    {
      title: 'Total Order',
      value: 1234,
      icon: <Car size={24} />,
      trend: '+12%',
      color: 'sky' as const,
    },
    {
      title: 'Pendapatan',
      value: 'Rp 125.5M',
      icon: <DollarSign size={24} />,
      trend: '+8%',
      color: 'emerald' as const,
    },
    {
      title: 'Mobil Tersedia',
      value: 87,
      icon: <Car size={24} />,
      trend: '+5',
      color: 'amber' as const,
    },
    {
      title: 'Pending Orders',
      value: 23,
      icon: <Clock size={24} />,
      color: 'rose' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, idx) => (
        <MetricCard
          key={idx}
          {...metric}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
}
