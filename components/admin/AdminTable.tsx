'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  totalPrice: number;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Budi Santoso',
    carName: 'Toyota Avanza',
    startDate: '2026-07-12',
    endDate: '2026-07-15',
    status: 'active',
    totalPrice: 1200000,
  },
  {
    id: 'ORD-002',
    customerName: 'Siti Nurhaliza',
    carName: 'Honda Jazz',
    startDate: '2026-07-14',
    endDate: '2026-07-18',
    status: 'pending',
    totalPrice: 950000,
  },
  {
    id: 'ORD-003',
    customerName: 'Ahmad Wijaya',
    carName: 'Daihatsu Xenia',
    startDate: '2026-07-08',
    endDate: '2026-07-10',
    status: 'overdue',
    totalPrice: 750000,
  },
  {
    id: 'ORD-004',
    customerName: 'Eka Putri',
    carName: 'Mitsubishi Xpander',
    startDate: '2026-06-30',
    endDate: '2026-07-05',
    status: 'completed',
    totalPrice: 1800000,
  },
];

function StatusBadge({ status }: { status: Order['status'] }) {
  const statusConfig = {
    active: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-400/30',
      text: 'text-emerald-300',
      icon: CheckCircle,
      label: 'Active',
      animation: '',
    },
    pending: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-400/30',
      text: 'text-amber-300',
      icon: Clock,
      label: 'Pending',
      animation: 'animate-pulse-glow',
    },
    overdue: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-400/30',
      text: 'text-rose-300',
      icon: AlertCircle,
      label: 'Overdue',
      animation: 'animate-blink-alert',
    },
    completed: {
      bg: 'bg-slate-500/10',
      border: 'border-slate-400/30',
      text: 'text-slate-300',
      icon: XCircle,
      label: 'Completed',
      animation: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.animation}`}>
      <Icon size={16} className={config.text} />
      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
    </div>
  );
}

export function AdminTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl bg-slate-800/30 border border-sky-400/20 backdrop-blur-sm overflow-x-auto"
    >
      <h3 className="text-xl font-bold text-white mb-6">Recent Orders</h3>
      
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Order ID</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Customer</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Car</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Duration</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Price</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map((order, idx) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
            >
              <td className="py-4 px-4 text-sm font-semibold text-sky-400">{order.id}</td>
              <td className="py-4 px-4 text-sm text-slate-300">{order.customerName}</td>
              <td className="py-4 px-4 text-sm text-slate-300">{order.carName}</td>
              <td className="py-4 px-4 text-sm text-slate-300">
                {new Date(order.startDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - {new Date(order.endDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              </td>
              <td className="py-4 px-4 text-sm font-semibold text-emerald-400">
                Rp {(order.totalPrice / 1000000).toFixed(1)}M
              </td>
              <td className="py-4 px-4"><StatusBadge status={order.status} /></td>
              <td className="py-4 px-4">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors border border-sky-400/20">
                  View
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
