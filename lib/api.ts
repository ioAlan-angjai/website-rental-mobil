// lib/api.ts - Real API client for Next.js frontend

import type { ApiResponse } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Cars API
  async getCars(status: string = 'AVAILABLE'): Promise<ApiResponse<any[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/cars?status=${status}`);
      const data = await res.json();
      return {
        success: res.ok,
        data: data.data || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gagal memuat data mobil',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCarById(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/cars/${id}`);
      const data = await res.json();
      return {
        success: res.ok,
        data: data.data || null,
        error: data.error,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gagal memuat data mobil',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Bookings API
  async getBookings(): Promise<ApiResponse<any[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/booking`);
      const data = await res.json();
      return {
        success: res.ok,
        data: data.data || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Gagal memuat riwayat booking',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const api = new ApiClient();
export default api;
