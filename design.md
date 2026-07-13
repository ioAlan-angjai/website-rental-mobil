---
version: alpha
name: "Rental Mobil Premium"
description: "Modern rental platform dengan premium interactions, micro-animations, dan real-time communication."
colors:
  primary: "#1F2937"
  secondary: "#0EA5E9"
  accent: "#F59E0B"
  success: "#10B981"
  warning: "#FBBF24"
  danger: "#EF4444"
  neutral-bg: "#F9FAFB"
  neutral-border: "#E5E7EB"
  neutral-text: "#6B7280"
  neutral-dark: "#111827"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: "Inter"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  heading-lg:
    fontFamily: "Inter"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.3
  heading-md:
    fontFamily: "Inter"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
rounded:
  none: "0"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
elevation:
  shadow-sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  shadow-md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  shadow-lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  shadow-xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    typography: "{typography.body-md}"
  button-primary-hover:
    backgroundColor: "#0284C7"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    typography: "{typography.body-md}"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-border}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    typography: "{typography.body-md}"
  badge-success:
    backgroundColor: "#DCFCE7"
    textColor: "#166534"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.caption}"
  badge-warning:
    backgroundColor: "#FEF3C7"
    textColor: "#92400E"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.caption}"
  badge-danger:
    backgroundColor: "#FEE2E2"
    textColor: "#991B1B"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.caption}"
  card:
    backgroundColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "24px"
    elevation: "{elevation.shadow-md}"
  input-field:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    borderColor: "{colors.neutral-border}"
  input-field-focus:
    borderColor: "{colors.secondary}"
---

## Overview

Platform rental mobil premium untuk mahasiswa di Yogyakarta dengan fokus pada **user experience interaktif**, **micro-interactions smooth**, dan **real-time communication**. Desain mengutamakan **accessibility**, **responsiveness**, dan **motion-driven storytelling** menggunakan Framer Motion. Arsitektur frontend dibangun dengan Next.js App Router + TypeScript, komponen UI dari shadcn/ui + 21st.dev, dan styling dengan Tailwind CSS.

**Target Users:**
- Mahasiswa (18-25 tahun) mencari rental murah dengan proses cepat
- Admin operasional mengelola booking dan verifikasi dokumen
- Owner untuk melihat analytics finansial dan denda

**Brand DNA:**
- **Modern**: Minimal, clean interface dengan subtle animations
- **Trustworthy**: Transparansi harga, verifikasi dokumen terlihat
- **Efficient**: Checkout cepat, real-time chat support 24/7
- **Smart**: Auto-calculation denda progresif, live status updates

---

## Folder Structure (App Router)

```
website-rental/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + providers (Framer, chat context)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global Tailwind styles
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (customer)/
│   │   ├── catalog/
│   │   │   ├── page.tsx          # Grid katalog mobil dengan Framer stagger
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detail mobil + parallax gallery
│   │   │       └── checkout/
│   │   │           └── page.tsx  # Form checkout + dropzone KTP/SIM
│   │   ├── orders/
│   │   │   ├── page.tsx          # List pesanan aktif
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Detail pesanan
│   │   └── profile/
│   │       └── page.tsx
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Admin overview + DataTable orders
│   │   │   ├── verification/
│   │   │   │   └── page.tsx      # Image lightbox KTP/SIM review
│   │   │   ├── chat/
│   │   │   │   └── page.tsx      # Split-screen chat workspace
│   │   │   └── analytics/
│   │   │       └── page.tsx      # Owner analytics chart
│   │   └── settings/
│   │       └── page.tsx
│   └── api/                      # Route handlers (mock untuk Phase 1)
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── cars/route.ts         # GET /api/cars (mock data)
│       ├── orders/route.ts       # GET/POST /api/orders
│       ├── chat/route.ts         # WebSocket mock stub
│       └── upload/route.ts       # File upload handling
│
├── components/                   # shadcn/ui + custom components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── table.tsx             # shadcn DataTable
│   │   ├── form.tsx              # react-hook-form integration
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   └── select.tsx
│   ├── layout/
│   │   ├── Header.tsx            # Navigation + logo
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx           # Admin sidebar navigation
│   │   └── ChatWidget.tsx        # Floating chat bubble (bottom-right)
│   ├── catalog/
│   │   ├── CatalogGrid.tsx       # Bento grid layout dengan Framer stagger
│   │   ├── CarCard.tsx           # Individual car card
│   │   ├── SearchFilters.tsx     # Date range picker + filters
│   │   └── CatalogHero.tsx       # Hero section magic text animation
│   ├── checkout/
│   │   ├── CheckoutForm.tsx      # Multi-step form
│   │   ├── DocumentDropzone.tsx  # File uploader KTP/SIM/KTM
│   │   ├── UploadSuccess.tsx     # Micro-interaction popup snap
│   │   └── PricingSummary.tsx    # Price breakdown card
│   ├── admin/
│   │   ├── OrdersDataTable.tsx   # Recharts + DataTable
│   │   ├── OrderStatusBadge.tsx  # Dynamic badge (Selesai/Pending/Overdue)
│   │   ├── VerificationLightbox.tsx  # Image carousel review
│   │   ├── ChatWorkspace.tsx     # Split-screen layout
│   │   ├── ChatPanel.tsx         # Messages list
│   │   ├── AnalyticsChart.tsx    # Recharts area/bar chart
│   │   └── PulsingOverdueIndicator.tsx  # Animated pulsing badge
│   ├── motion/
│   │   ├── FadeIn.tsx            # Wrapper Framer untuk fade-in
│   │   ├── SlideUp.tsx           # Wrapper untuk slide-up
│   │   ├── StaggerContainer.tsx  # Parent untuk stagger children
│   │   ├── StaggerChild.tsx      # Child di dalam stagger
│   │   ├── ParallaxScroll.tsx    # Scroll-linked parallax effect
│   │   └── PageTransition.tsx    # Shared layout halaman
│   └── chat/
│       ├── ChatMessages.tsx      # Message list dengan avatar
│       └── ChatInput.tsx         # Input + send button
│
├── lib/                          # Utilities & helpers
│   ├── api.ts                    # API client wrapper
│   ├── mock-data.ts              # Mock cars, orders, customers
│   ├── hooks/
│   │   ├── useChat.ts            # Chat context hook
│   │   └── usePricing.ts         # Pricing calculation logic
│   ├── utils/
│   │   ├── cn.ts                 # clsx/classname utility
│   │   ├── format.ts             # Number/date formatting
│   │   └── validation.ts         # Form validation schemas (Zod)
│   └── constants.ts              # App constants, API endpoints
│
├── styles/                       # Tailwind extensions
│   ├── globals.css
│   └── animations.css            # Custom Framer animation curves
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── cars/                 # Car thumbnails
│   │   ├── icons/
│   │   └── placeholder.svg
│   └── fonts/                    # Inter VF
│
├── types/                        # TypeScript definitions
│   ├── index.ts
│   ├── car.ts                    # Car interface
│   ├── order.ts                  # Order interface
│   ├── customer.ts               # Customer interface
│   ├── chat.ts                   # ChatMessage interface
│   └── api.ts
│
├── context/                      # React Context
│   ├── ChatContext.tsx
│   └── AuthContext.tsx
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local                    # Mock API endpoints

```

---

## Components

### A. shadcn/ui Core Primitives

Semua komponen foundational dari shadcn/ui sudah tersedia via `npx shadcn-ui@latest add`. Untuk rental mobil, kita gunakan:

- **Button** — CTA, submit checkout, action buttons
- **Card** — Container untuk car card, order summary
- **Input** — Text fields untuk form
- **Form** — react-hook-form wrapper untuk validasi
- **Table** — Recharts + shadcn DataTable untuk admin orders
- **Badge** — Status indicators (✅ Selesai, ⏳ Menunggu, 🔴 Overdue)
- **Dialog** — Confirmation popups
- **Popover** — Date-range picker untuk pencarian
- **Dropdown-menu** — Admin action menu
- **Checkbox / Radio** — Pilihan asuransi, tipe pembayaran
- **Select** — Dropdown untuk kota, tipe mobil

### B. 21st.dev Patterns untuk Rental Mobil

**1. Dropzone File Uploader (KTP/SIM/KTM)**
   - Komponen: `DocumentDropzone.tsx`
   - Pattern: Drag-drop area dengan preview thumbnail
   - Integrasi: `react-dropzone` + `react-hook-form`
   - Micro-interaction: Snap pop-up saat upload sukses
   - Mock: Simpan ke localStorage atau state

**2. Bento Grid Layout (Katalog Mobil)**
   - Komponen: `CatalogGrid.tsx`
   - Layout: 3 kolom di desktop, 1-2 di mobile (responsive)
   - Card size: Beberapa card lebih besar (featured cars)
   - Integrasi: Framer Motion stagger delay per item
   - Mock: Array 12-15 mobil dari mock-data.ts

**3. DataTable dengan Filter & Sort (Admin Orders)**
   - Komponen: `OrdersDataTable.tsx`
   - Kolom: Order ID, Pelanggan, Mobil, Tanggal, Status, Total Denda
   - Features: Pencarian real-time, sort, filter by status
   - Row Action: Edit, verifikasi dokumen, lihat detail
   - Integr: `@tanstack/react-table` + shadcn table primitive
   - Status Badge: Custom color per status (success/warning/danger)

**4. Image Lightbox / Carousel (Verifikasi Dokumen)**
   - Komponen: `VerificationLightbox.tsx`
   - Pattern: Modal dengan prev/next navigation
   - Blur-background: Untuk privacy
   - Integrasi: `react-medium-image-zoom` atau custom

**5. Split-screen Workspace Layout (Admin Chat)**
   - Komponen: `ChatWorkspace.tsx`
   - Layout: Left sidebar order list, center messages, right customer detail
   - Sticky header dengan order info
   - Integrasi: Flex layout Tailwind

---

## Motion UI (Framer Motion)

### A. Scroll-Linked Animations (Katalog)

**Implementasi Staggered Catalog Grid:**

```typescript
// components/motion/StaggerContainer.tsx
import { motion } from "framer-motion";

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay antar item
      delayChildren: 0.2,
    },
  },
};

const staggerChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function StaggerContainer({ children, ...props }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({ children, ...props }) {
  return (
    <motion.div variants={staggerChildVariants} {...props}>
      {children}
    </motion.div>
  );
}
```

**Usage di CatalogGrid:**
```typescript
<StaggerContainer className="grid grid-cols-3 gap-6">
  {cars.map((car) => (
    <StaggerChild key={car.id}>
      <CarCard car={car} />
    </StaggerChild>
  ))}
</StaggerContainer>
```

### B. Parallax Scroll Effect (Detail Mobil)

```typescript
// components/motion/ParallaxScroll.tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ParallaxGallery({ images }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]); // 300px parallax offset

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={images[0]}
          alt="Hero"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
```

### C. Micro-Interaction: Upload Success Snap

```typescript
// components/checkout/UploadSuccess.tsx
import { motion, AnimatePresence } from "framer-motion";

export function UploadSuccess({ isVisible, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="fixed bottom-6 right-6 bg-green-500 text-white rounded-lg p-4"
        >
          ✓ Dokumen berhasil diunggah
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### D. Page Transitions (Shared Layout)

```typescript
// components/motion/PageTransition.tsx
import { motion } from "framer-motion";

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### E. Pulsing Overdue Indicator

```typescript
// components/admin/PulsingOverdueIndicator.tsx
import { motion } from "framer-motion";

const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

export function PulsingOverdueIndicator({ count }) {
  return (
    <motion.div
      variants={pulseVariants}
      animate="pulse"
      className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
      </span>
      {count} Keterlambatan
    </motion.div>
  );
}
```

### F. Animation Configuration (tailwind.config.ts)

```typescript
export default {
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "ping-subtle": "pingSutle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pingSutle: {
          "75%, 100%": { transform: "scale(1.05)", opacity: "0.2" },
        },
      },
    },
  },
};
```

---

## Mock Data Structures

Untuk **Phase 1**, semua data disimpan di `lib/mock-data.ts` (TypeScript objects). Nanti di Phase 2 diganti dengan API calls + database.

### A. Car (Mobil) Data Type

```typescript
// types/car.ts
export interface Car {
  id: string;
  name: string;
  brand: "Toyota" | "Honda" | "Mitsubishi" | "Daihatsu";
  model: string;
  year: number;
  category: "economy" | "comfort" | "premium";
  pricePerDay: number; // Rp
  pricePerHour: number; // Rp (untuk rental < 1 hari)
  transmission: "manual" | "automatic";
  seats: number;
  fuelType: "bensin" | "diesel" | "hybrid";
  mileage: number; // km
  images: string[]; // URL array
  description: string;
  availability: boolean;
  studentDiscount: number; // % (e.g., 15 = 15%)
  features: string[]; // ["AC", "Power Steering", "ABS", ...]
}
```

**Mock Data:**
```typescript
// lib/mock-data.ts
export const mockCars: Car[] = [
  {
    id: "car-001",
    name: "Avanza 1.3L",
    brand: "Toyota",
    model: "Avanza",
    year: 2023,
    category: "economy",
    pricePerDay: 200000,
    pricePerHour: 30000,
    transmission: "manual",
    seats: 7,
    fuelType: "bensin",
    mileage: 45000,
    images: ["/images/cars/avanza-1.jpg", "/images/cars/avanza-2.jpg"],
    description: "Mobil keluarga terjangkau, cocok untuk perjalanan panjang",
    availability: true,
    studentDiscount: 20,
    features: ["AC", "Power Steering", "ABS", "Kursi Empuk"],
  },
  {
    id: "car-002",
    name: "HR-V 1.5L",
    brand: "Honda",
    model: "HR-V",
    year: 2022,
    category: "comfort",
    pricePerDay: 280000,
    pricePerHour: 42000,
    transmission: "automatic",
    seats: 5,
    fuelType: "bensin",
    mileage: 32000,
    images: ["/images/cars/hrv-1.jpg"],
    description: "SUV modern dengan fitur lengkap dan interior rapi",
    availability: true,
    studentDiscount: 15,
    features: ["AC", "Power Steering", "ABS", "Cruise Control", "Bluetooth"],
  },
  // ... 10+ cars lainnya
];
```

### B. Customer (Pelanggan) Data Type

```typescript
// types/customer.ts
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
```

**Mock Data:**
```typescript
export const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    email: "budi@example.com",
    name: "Budi Santoso",
    phone: "+62812-1234-5678",
    birthDate: "2003-05-15",
    studentId: "UGM-2021-12345",
    address: "Jl. Kaliurang No. 45, Yogyakarta",
    identityType: "ktp",
    identityNumber: "3402011503030001",
    isVerified: true,
    studentVerified: true,
    createdAt: "2025-01-10",
    updatedAt: "2025-06-20",
  },
  // ... more customers
];
```

### C. Order (Transaksi Sewa) Data Type

```typescript
// types/order.ts
export interface Order {
  id: string;
  customerId: string;
  carId: string;
  rentalStartDate: string; // ISO datetime
  rentalEndDate: string; // ISO datetime
  rentalEndActualDate?: string; // Jika dikembalikan lebih awal/lambat
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
```

**Mock Data:**
```typescript
export const mockOrders: Order[] = [
  {
    id: "order-001",
    customerId: "cust-001",
    carId: "car-001",
    rentalStartDate: "2025-06-20T10:00:00Z",
    rentalEndDate: "2025-06-22T10:00:00Z",
    pricePerDay: 200000,
    insuranceSelected: true,
    insurancePrice: 50000,
    subtotal: 450000,
    penaltyAccumulated: 0,
    status: "active",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    documentsVerified: true,
    documentUrls: {
      ktpUrl: "/uploads/ktp-cust-001.jpg",
      simUrl: "/uploads/sim-cust-001.jpg",
    },
    notes: "Customer tambah asuransi comprehensive",
    createdAt: "2025-06-19T14:30:00Z",
    updatedAt: "2025-06-20T09:45:00Z",
  },
  {
    id: "order-002",
    customerId: "cust-002",
    carId: "car-002",
    rentalStartDate: "2025-06-21T08:00:00Z",
    rentalEndDate: "2025-06-23T18:00:00Z",
    rentalEndActualDate: "2025-06-24T02:30:00Z", // Keterlambatan 8.5 jam
    pricePerDay: 280000,
    insuranceSelected: false,
    insurancePrice: 0,
    subtotal: 560000,
    penaltyAccumulated: 425000, // Rp50k/jam × 8.5 jam = Rp425k
    status: "overdue",
    paymentMethod: "cash",
    paymentStatus: "partial",
    documentsVerified: true,
    documentUrls: {
      ktpUrl: "/uploads/ktp-cust-002.jpg",
      simUrl: "/uploads/sim-cust-002.jpg",
    },
    notes: "Keterlambatan karena macet",
    createdAt: "2025-06-20T16:00:00Z",
    updatedAt: "2025-06-24T02:31:00Z",
  },
];
```

### D. Chat Message Data Type

```typescript
// types/chat.ts
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
```

**Mock Data:**
```typescript
export const mockMessages: ChatMessage[] = [
  {
    id: "msg-001",
    orderId: "order-001",
    customerId: "cust-001",
    senderType: "customer",
    message: "Halo, saya mau tanya soal asuransi",
    timestamp: "2025-06-20T10:15:00Z",
    isRead: true,
  },
  {
    id: "msg-002",
    orderId: "order-001",
    adminId: "admin-001",
    senderType: "admin",
    message: "Halo Budi! Asuransi comprehensive mencakup kerusakan minor dan pencurian.",
    timestamp: "2025-06-20T10:16:30Z",
    isRead: true,
  },
];
```

---

## Do's and Don'ts

### Do's ✅

- **Do** gunakan Framer Motion untuk micro-interactions (button hover, modal entrance)
- **Do** implementasikan stagger delay di catalog grid untuk premium feel
- **Do** gunakan shadcn/ui primitives sebagai base, extend dengan Tailwind
- **Do** validasi form dengan Zod + react-hook-form sebelum submit
- **Do** display status badge dengan warna yang konsisten (WCAG AA contrast min)
- **Do** simpan file dokumen di mock localStorage untuk Phase 1
- **Do** gunakan TypeScript strict mode untuk type safety
- **Do** test responsive di desktop (1920px), tablet (768px), mobile (375px)
- **Do** lazy-load images di catalog dengan Next.js Image component
- **Do** display loading state saat fetch API (skeleton screens)

### Don'ts ❌

- **Don't** hardcode warna — selalu referensikan dari design tokens
- **Don't** gunakan inline styles, prioritaskan Tailwind classes
- **Don't** upload dokumen ke public folder, gunakan presigned URLs (Phase 2)
- **Don't** render 1000+ items tanpa virtualization (infinite scroll)
- **Don't** trigger animations onMount untuk semua elemen — selective motion sahaja
- **Don't** skip form validation, selalu show error messages
- **Don't** mix component styling libraries (Tailwind + CSS Modules + styled-components)
- **Don't** forget accessibility: alt text, ARIA labels, keyboard navigation

---

## Accessibility (WCAG AA)

- **Color Contrast:** Button text vs background min 4.5:1 ratio ✓ (Blue #0EA5E9 on white = 5.2:1)
- **Focus States:** Semua interactive elements harus :focus-visible dengan outline
- **Motion:** Respek `prefers-reduced-motion` media query untuk animations
- **Semantic HTML:** Gunakan `<button>`, `<input>`, `<label>` bukan `<div>` role=button
- **Alt Text:** Semua images harus punya alt text yg deskriptif (terutama car galleries)
- **Form Labels:** Setiap input field must have associated `<label>`
- **Skip Links:** Add "Skip to content" link di header (terutama penting untuk admin dashboard)

---

## Development Checklist (Phase 1)

- [ ] Setup Next.js 14+ dengan TypeScript + App Router
- [ ] Install shadcn/ui + Framer Motion + Tailwind CSS
- [ ] Create folder structure sesuai spec di atas
- [ ] Define TypeScript interfaces (car.ts, order.ts, customer.ts, chat.ts)
- [ ] Populate mock-data.ts dengan 15+ cars, 5+ customers, 10+ orders
- [ ] Build Landing Page dengan CatalogHero + magic text animation
- [ ] Build Catalog Grid dengan StaggerContainer (3 kolom, responsive)
- [ ] Build Car Detail page dengan ParallaxGallery + sticky info panel
- [ ] Build Checkout page dengan DocumentDropzone + multi-step form
- [ ] Build Admin Dashboard dengan OrdersDataTable + status badges
- [ ] Build Verification Lightbox untuk dokumen review
- [ ] Build Chat Widget (floating) + Admin Chat Workspace (split-screen)
- [ ] Implement all Framer Motion patterns (stagger, parallax, snap, pulse)
- [ ] Test responsive layout (desktop, tablet, mobile)
- [ ] Run accessibility audit (axe DevTools, Lighthouse)
- [ ] Document component props + usage

---

## Summary

Draf `design.md` ini memberikan **blueprint lengkap** untuk Phase 1 frontend development:

1. **Folder Structure** — Organized, scalable, aligned dengan Next.js best practices
2. **Component Inventory** — shadcn/ui primitives + 21st.dev patterns untuk use case rental
3. **Motion UI Strategy** — Framer Motion implementation guide dengan practical code snippets
4. **Mock Data** — TypeScript interfaces + sample data siap copy-paste
5. **Design Tokens** — Colors, typography, spacing, shadows dalam YAML spec
6. **Accessibility** — WCAG AA compliance checklist

**Next Step:** Jalankan development checklist di atas dan mulai ngoding components! 🚗✨
