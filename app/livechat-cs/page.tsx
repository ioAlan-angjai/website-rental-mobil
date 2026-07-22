'use client';

import { AdminLiveChat } from '@/components/admin/chat/AdminLiveChat';

export default function LiveChatCSPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-900">Live Chat Customer Service</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pusat layanan chat — kelola percakapan dengan calon penyewa secara realtime
          </p>
        </div>
        <AdminLiveChat />
      </div>
    </div>
  );
}
