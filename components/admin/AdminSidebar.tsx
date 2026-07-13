'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BarChart3, Car, MessageSquare, CheckCircle, Settings, Menu, X } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: 'sky' | 'emerald' | 'amber' | 'rose';
}

const navItems: NavItem[] = [
  { icon: <BarChart3 size={20} />, label: 'Dashboard', href: '#analytics', color: 'sky' },
  { icon: <Car size={20} />, label: 'Vehicles', href: '#vehicles', color: 'emerald' },
  { icon: <MessageSquare size={20} />, label: 'Chat', href: '#chat', color: 'amber' },
  { icon: <CheckCircle size={20} />, label: 'Verification', href: '#verification', color: 'rose' },
  { icon: <Settings size={20} />, label: 'Settings', href: '#settings', color: 'sky' },
];

const colorMap = {
  sky: 'text-sky-400 hover:bg-sky-500/10',
  emerald: 'text-emerald-400 hover:bg-emerald-500/10',
  amber: 'text-amber-400 hover:bg-amber-500/10',
  rose: 'text-rose-400 hover:bg-rose-500/10',
};

export function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-24 flex-col bg-gradient-to-b from-slate-900 to-slate-800 border-r border-sky-400/10 pt-6 z-30"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-gradient-to-br from-sky-400 to-amber-400 rounded-xl">
            <Car size={24} className="text-slate-900" />
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-4 px-3">
          {navItems.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
              className={`flex justify-center p-4 rounded-lg transition-all ${colorMap[item.color]}`}
            >
              {item.icon}
            </motion.a>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 bg-gradient-to-br from-sky-400 to-amber-400 text-slate-900 rounded-lg"
      >
        {isExpanded ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="md:hidden fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-sky-400/10 pt-20 z-30"
          >
            <nav className="space-y-2 px-4">
              {navItems.map((item, idx) => (
                <motion.a
                  key={idx}
                  href={item.href}
                  whileHover={{ x: 8 }}
                  onClick={() => setIsExpanded(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${colorMap[item.color]}`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.a>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

