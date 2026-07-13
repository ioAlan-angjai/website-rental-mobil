// types/index.ts - All TypeScript interfaces for rental platform

export interface Car {
  id: string;
  name: string;
  brand: "Toyota" | "Honda" | "Mitsubishi" | "Daihatsu";
  model: string;
  year: number;
  category: "economy" | "comfort" | "premium";
  pricePerDay: number; // Rp
  pricePerHour: number; // Rp
  transmission: "manual" | "automatic";
  seats: number;
  fuelType: "bensin" | "diesel" | "hybrid";
  mileage: number; // km
  images: string[];
  description: string;
  availability: boolean;
  studentDiscount: number; // %
  features: string[];
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  birthDate: string; // ISO date
  studentId?: string;
  address: string;
  identityType: "ktp" | "sim" | "ktm";
  identityNumber: string;
  isVerified: boolean;
  studentVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  carId: string;
  rentalStartDate: string; // ISO datetime
  rentalEndDate: string; // ISO datetime
  rentalEndActualDate?: string;
  pricePerDay: number;
  insuranceSelected: boolean;
  insurancePrice: number;
  subtotal: number;
  penaltyAccumulated: number; // Rp
  status: "pending" | "confirmed" | "active" | "completed" | "overdue" | "cancelled";
  paymentMethod: "transfer" | "cash" | "card";
  paymentStatus: "unpaid" | "paid" | "partial";
  documentsVerified: boolean;
  documentUrls: {
    ktpUrl: string;
    simUrl: string;
    ktmUrl?: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  customerId: string;
  adminId?: string;
  senderType: "customer" | "admin";
  message: string;
  attachmentUrl?: string;
  attachmentType?: "image" | "document";
  timestamp: string; // ISO
  isRead: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
