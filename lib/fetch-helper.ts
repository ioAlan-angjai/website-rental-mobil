import { useState, useCallback } from 'react';
import { parseError, ApiError } from './error-handler';

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useFetch<T = any>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (url: string, options: FetchOptions = {}) => {
    setState({ data: null, loading: true, error: null });

    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = parseError(new Error(data.error?.message || data.message || 'Request failed'));
        setState({ data: null, loading: false, error });
        return { success: false, data: null, error };
      }

      setState({ data: data.data || data, loading: false, error: null });
      return { success: true, data: data.data || data, error: null };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutError = parseError(new Error('timeout'));
        setState({ data: null, loading: false, error: timeoutError });
        return { success: false, data: null, error: timeoutError };
      }

      const error = parseError(err);
      setState({ data: null, loading: false, error });
      return { success: false, data: null, error };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchOptions = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<{ success: boolean; data: T | null; error: ApiError | null }> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { timeout = 30000, ...fetchOptions } = options;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = parseError(new Error(data.error?.message || data.message || 'Request failed'));
        lastError = error;

        if (response.status >= 400 && response.status < 500) {
          return { success: false, data: null, error };
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        return { success: false, data: null, error };
      }

      return { success: true, data: data.data || data, error: null };
    } catch (err) {
      lastError = parseError(err);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
    }
  }

  return { success: false, data: null, error: lastError };
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }

  return 'Terjadi kesalahan yang tidak diketahui';
}
