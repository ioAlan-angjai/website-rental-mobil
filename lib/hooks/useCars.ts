import { useQuery } from '@tanstack/react-query';

export interface CarsFilter {
  page?: number;
  limit?: number;
  category?: string;
  transmission?: string;
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CarsResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    year: number;
    transmission: string;
    fuelType: string;
    seats: number;
    pricePerDay: number;
    images: string;
    status: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function useCars(filters: CarsFilter = {}) {
  const queryKey = ['cars', filters];

  return useQuery<CarsResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.transmission && filters.transmission !== 'all') params.append('transmission', filters.transmission);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));

      const response = await fetch(`/api/cars?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch cars');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
