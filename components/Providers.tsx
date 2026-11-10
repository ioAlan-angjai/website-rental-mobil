'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
    </QueryClientProvider>
  );
}
