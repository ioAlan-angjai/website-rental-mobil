'use client';

import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { AdminTable } from '@/components/admin/AdminTable';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="md:ml-24">
        {/* Header */}
        <AdminHeader />

        {/* Content Area */}
        <div className="p-8">
          {/* Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <AdminMetrics />
          </motion.div>

          {/* Recent Orders Section */}
          <AdminTable />

          {/* Quick Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Top Customers */}
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-sky-400/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Top Customers</h3>
              <div className="space-y-4">
                {[
                  { name: 'Budi Santoso', orders: 12, spent: 'Rp 14.4M' },
                  { name: 'Siti Nurhaliza', orders: 8, spent: 'Rp 9.6M' },
                  { name: 'Ahmad Wijaya', orders: 6, spent: 'Rp 7.2M' },
                ].map((customer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-white">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.orders} orders</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{customer.spent}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Vehicle Status */}
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-sky-400/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Vehicle Status</h3>
              <div className="space-y-4">
                {[
                  { status: 'Available', count: 87, color: 'emerald' },
                  { status: 'Rented', count: 12, color: 'sky' },
                  { status: 'Maintenance', count: 3, color: 'amber' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.status}</span>
                      <span className={`font-bold text-${item.color}-400`}>{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600`}
                        style={{ width: `${(item.count / 102) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
