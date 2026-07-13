// lib/api.ts - API client wrapper untuk mock data Phase 1

import type { Car, Customer, Order, ChatMessage, ApiResponse } from '@/types';
import { mockCars, mockCustomers, mockOrders, mockMessages } from './mock-data';

class ApiClient {
  constructor(_baseUrl: string = '') {
    // baseUrl reserved for Phase 2 backend integration
  }

  // Simulate API delay
  private async delay(ms: number = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cars API
  async getCars(): Promise<ApiResponse<Car[]>> {
    await this.delay();
    return {
      success: true,
      data: mockCars,
      timestamp: new Date().toISOString(),
    };
  }

  async getCarById(id: string): Promise<ApiResponse<Car>> {
    await this.delay();
    const car = mockCars.find((c) => c.id === id);
    if (!car) {
      return {
        success: false,
        error: 'Mobil tidak ditemukan',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: car,
      timestamp: new Date().toISOString(),
    };
  }

  // Customers API
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    await this.delay();
    const customer = mockCustomers.find((c) => c.id === id);
    if (!customer) {
      return {
        success: false,
        error: 'Pelanggan tidak ditemukan',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: customer,
      timestamp: new Date().toISOString(),
    };
  }

  // Orders API
  async getOrders(): Promise<ApiResponse<Order[]>> {
    await this.delay();
    return {
      success: true,
      data: mockOrders,
      timestamp: new Date().toISOString(),
    };
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    await this.delay();
    const order = mockOrders.find((o) => o.id === id);
    if (!order) {
      return {
        success: false,
        error: 'Pesanan tidak ditemukan',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    };
  }

  async getOrdersByCustomerId(customerId: string): Promise<ApiResponse<Order[]>> {
    await this.delay();
    const orders = mockOrders.filter((o) => o.customerId === customerId);
    return {
      success: true,
      data: orders,
      timestamp: new Date().toISOString(),
    };
  }

  // Chat API
  async getMessages(orderId: string): Promise<ApiResponse<ChatMessage[]>> {
    await this.delay();
    const messages = mockMessages.filter((m) => m.orderId === orderId);
    return {
      success: true,
      data: messages,
      timestamp: new Date().toISOString(),
    };
  }

  async sendMessage(message: ChatMessage): Promise<ApiResponse<ChatMessage>> {
    await this.delay(300);
    return {
      success: true,
      data: message,
      timestamp: new Date().toISOString(),
    };
  }
}

export const apiClient = new ApiClient();
