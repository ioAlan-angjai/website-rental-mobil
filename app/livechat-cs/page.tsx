'use client';

import { useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar, TabType } from '@/components/admin/AdminSidebar';
import { AdminLiveChat } from '@/components/admin/chat/AdminLiveChat';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiveChatCSPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AdminSidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <div className="flex flex-col sm:gap-4 sm:py-4 flex-1 w-full overflow-hidden">
        <AdminHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 flex flex-col px-4 sm:px-6 pb-4 overflow-hidden">
          {/* Back Button + Header */}
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Live Chat CS
            </h1>
          </div>

          {/* Live Chat Panel */}
          <div className="flex-1 min-h-0">
            <AdminLiveChat />
          </div>
        </main>
      </div>
    </div>
  );
}
