// hooks/useApi.ts - Custom hook untuk API calls

import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types';

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  return { data, isLoading, error, execute };
}
