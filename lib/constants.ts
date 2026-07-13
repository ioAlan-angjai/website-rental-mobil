// lib/constants.ts - App constants and configuration

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CATALOG: '/catalog',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VERIFICATION: '/admin/dashboard/verification',
  ADMIN_CHAT: '/admin/dashboard/chat',
  ADMIN_ANALYTICS: '/admin/dashboard/analytics',
};

export const STUDENT_DISCOUNT_PERCENTAGE = {
  ECONOMY: 25,
  COMFORT: 18,
  PREMIUM: 12,
};

export const PENALTY_CONFIG = {
  GRACE_PERIOD_MINUTES: 30,
  PENALTY_PER_HOUR: 50000,
  PENALTY_THRESHOLD_HOURS: 6,
  FULL_DAY_EQUIVALENT: 'rentals day rate',
};

export const CAR_CATEGORIES = ['economy', 'comfort', 'premium'] as const;
export const ORDER_STATUS = [
  'pending',
  'confirmed',
  'active',
  'completed',
  'overdue',
  'cancelled',
] as const;
export const PAYMENT_METHODS = ['transfer', 'cash', 'card'] as const;
export const PAYMENT_STATUS = ['unpaid', 'paid', 'partial'] as const;

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil! Selamat datang.',
  LOGIN_ERROR: 'Email atau password salah.',
  REGISTER_SUCCESS: 'Pendaftaran berhasil! Silakan login.',
  REGISTER_ERROR: 'Pendaftaran gagal. Coba lagi.',
  DOCUMENT_UPLOAD_SUCCESS: 'Dokumen berhasil diunggah!',
  DOCUMENT_UPLOAD_ERROR: 'Gagal upload dokumen. Format harus JPG/PNG, max 5MB.',
  ORDER_CREATED: 'Pesanan berhasil dibuat!',
  ORDER_CANCELLED: 'Pesanan dibatalkan.',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};
