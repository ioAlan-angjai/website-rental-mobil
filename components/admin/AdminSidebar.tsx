'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  LogOut,
  CarFront,
  Menu,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type TabType = 'overview' | 'bookings' | 'cars' | 'drivers';

interface AdminSidebarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
}

export function AdminSidebar({ activeTab, onNavigate }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 180 && newWidth <= 360) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const navItems = [
    { id: 'overview' as TabType, label: 'Dasbor', icon: LayoutDashboard },
    { id: 'bookings' as TabType, label: 'Pemesanan', icon: CalendarCheck },
    { id: 'cars' as TabType, label: 'Armada', icon: Car },
    { id: 'drivers' as TabType, label: 'Driver', icon: Users },
  ];

  const handleNavigate = (tab: TabType) => {
    onNavigate(tab);
    router.push('/admin');
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-white text-zinc-800 border-r border-zinc-200/80 select-none">
        {/* Header / Brand Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-zinc-100 px-4 transition-all justify-between",
          collapsed && "px-2 justify-center"
        )}>
          <div className="flex items-center gap-3 font-bold text-zinc-900 overflow-hidden">
            <div className="h-9 w-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <CarFront size={20} />
            </div>
            {!collapsed && (
              <span className="text-base font-extrabold tracking-tight truncate">Rental Admin</span>
            )}
          </div>

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-700 hidden md:flex shrink-0"
              onClick={() => setIsCollapsed(true)}
              title="Ciutkan Sidebar"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <div className="px-3 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Menu Utama
            </div>
          )}
          
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const buttonContent = (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-zinc-500")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger className="w-full">{buttonContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
          

        </div>

        {/* Profile & Footer */}
        <div className="mt-auto border-t border-zinc-100 p-3 space-y-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-semibold text-red-600">
                Keluar
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                <Avatar className="h-9 w-9 border border-zinc-200">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs">AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-zinc-900 truncate">Admin Utama</span>
                  <span className="text-[11px] text-zinc-500 truncate">admin@rental.com</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-zinc-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl text-xs font-semibold"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          )}

          {collapsed && (
            <div className="pt-2 flex justify-center border-t border-zinc-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
                onClick={() => setIsCollapsed(false)}
                title="Buka Sidebar"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger className="inline-flex items-center justify-center rounded-xl border bg-white p-2 text-sm font-medium shrink-0 md:hidden absolute top-3 left-4 z-50 shadow-sm">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="sr-only">Buka menu navigasi</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop Resizable & Collapsible Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: isCollapsed ? 72 : sidebarWidth }}
        className="hidden md:block min-h-screen relative group transition-all duration-200 ease-out shrink-0"
      >
        <div className="sticky top-0 h-screen w-full">
          <SidebarContent collapsed={isCollapsed} />
        </div>

        {/* Resizable Handle (Right border drag handle) */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            className={cn(
              "absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-30 flex items-center justify-center",
              isResizing && "bg-blue-600 w-2"
            )}
            title="Geser untuk mengubah lebar sidebar"
          >
            <div className="opacity-0 group-hover:opacity-100 bg-zinc-400 text-white rounded p-0.5 shadow-sm">
              <GripVertical size={10} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
