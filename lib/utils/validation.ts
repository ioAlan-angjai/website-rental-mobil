// lib/utils/validation.ts - Form validation schemas using Zod

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  studentId: z.string().optional(),
  birthDate: z.string(),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const checkoutSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  insuranceSelected: z.boolean(),
  paymentMethod: z.enum(['transfer', 'cash', 'card']),
  notes: z.string().optional(),
});

export const documentUploadSchema = z.object({
  documentType: z.enum(['ktp', 'sim', 'ktm']),
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File maksimal 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'Format hanya JPG atau PNG'
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
