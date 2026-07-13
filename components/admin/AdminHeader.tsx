'use client';

import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';

export function AdminHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 px-8 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-sky-400/10 backdrop-blur-md flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your rental fleet and orders</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-all">
          <Bell size={20} className="text-slate-400 hover:text-sky-400 transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
          <Settings size={20} className="text-slate-400 hover:text-sky-400 transition-colors" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-amber-400" />
          <div className="text-sm">
            <p className="font-semibold text-white">Admin</p>
            <p className="text-xs text-slate-400">Active</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
