# Error Handling Implementation Guide

## Overview
Sistem error handling yang komprehensif dan informatif telah diimplementasikan di seluruh project untuk meningkatkan keamanan, user experience, dan maintainability.

## 🎯 Goals
1. **Keamanan**: Mencegah kebocoran informasi sensitif ke client
2. **User Experience**: Pesan error yang jelas dan actionable
3. **Developer Experience**: Logging yang detail untuk debugging
4. **Consistency**: Format error yang seragam di seluruh aplikasi

---

## 📁 File Struktur Error Handler

### 1. Core Error Handler (`lib/error-handler.ts`)
**Fungsi Utama:**
- `createApiError()` - Membuat error object terstruktur
- `parseError()` - Parse error dari berbagai format
- `logError()` - Log error dengan severity level
- Error codes standar (VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND, dll)

**Error Severity Levels:**
- `info` - Informasi non-critical
- `warning` - Peringatan yang perlu perhatian
- `error` - Error yang perlu ditangani
- `critical` - Error kritis yang memerlukan immediate action

### 2. API Response Builder (`lib/api-response.ts`)
**Fungsi Utama:**
- `ApiResponseBuilder.success()` - Response sukses
- `ApiResponseBuilder.error()` - Response error custom
- `ApiResponseBuilder.validationError()` - Validation errors
- `ApiResponseBuilder.unauthorized()` - 401 errors
- `ApiResponseBuilder.forbidden()` - 403 errors
- `ApiResponseBuilder.notFound()` - 404 errors
- `ApiResponseBuilder.internalError()` - 500 errors
- `ApiResponseBuilder.databaseError()` - Database errors

**Keamanan:**
- Error details hanya ditampilkan di development mode
- Production mode hanya menampilkan user-friendly messages
- Stack traces tidak pernah di-expose ke client

### 3. Fetch Helper (`lib/fetch-helper.ts`)
**Fungsi Utama:**
- `useFetch()` - React hook untuk fetch dengan error handling
- `fetchWithRetry()` - Fetch dengan automatic retry mechanism
- `getErrorMessage()` - Extract error message dari berbagai format

**Features:**
- Automatic timeout handling (default 30s)
- Retry mechanism untuk network errors
- Abort controller untuk cancel requests

### 4. Toast Notifications (`lib/toast.ts`)
**Fungsi Utama:**
- `toast.success()` - Success notifications
- `toast.error()` - Error notifications
- `toast.warning()` - Warning notifications
- `toast.info()` - Info notifications
- `toast.promise()` - Promise-based notifications

### 5. UI Components (`components/ui/error-display.tsx`)
**Components:**
- `<ErrorDisplay />` - Display error dengan styling berdasarkan severity
- `<ErrorBoundaryFallback />` - Fallback UI untuk error boundaries

**Features:**
- Color-coded by severity
- Retry button untuk recoverable errors
- Development mode menampilkan details
- Responsive design

---

## 🔧 Implementation

### Backend API Routes

#### Before (Tidak Aman):
```typescript
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // ... logic
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```

#### After (Aman & Informatif):
```typescript
import { ApiResponseBuilder } from "@/lib/api-response";
import { logError, createApiError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponseBuilder.unauthorized('Silakan login terlebih dahulu');
    }

    const data = await req.json();
    
    if (!data.field) {
      return ApiResponseBuilder.validationError(
        'Field harus diisi',
        { field: 'Field is required' }
      );
    }

    // ... business logic
    
    return ApiResponseBuilder.success({ result: 'data' });
  } catch (error) {
    logError(createApiError('INTERNAL_ERROR'), 'POST /api/endpoint');
    
    if (error?.code?.startsWith('P')) {
      return ApiResponseBuilder.databaseError(error);
    }
    
    return ApiResponseBuilder.internalError(error, 'Endpoint Name');
  }
}
```

### Frontend Pages

#### Before:
```typescript
useEffect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(res => setData(res.data))
    .catch(console.error);
}, []);
```

#### After:
```typescript
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/fetch-helper';
import { ErrorDisplay } from '@/components/ui/error-display';

const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/data');
      const res = await response.json();
      
      if (!response.ok) {
        throw new Error(res.error?.message || 'Failed to fetch data');
      }
      
      setData(res.data);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

// In JSX:
{error && (
  <ErrorDisplay 
    error={error} 
    onRetry={() => fetchData()} 
  />
)}
```

---

## 📋 Error Codes Reference

| Code | Status | User Message | Use Case |
|------|--------|--------------|----------|
| `VALIDATION_ERROR` | 400 | Data tidak valid | Invalid input |
| `UNAUTHORIZED` | 401 | Silakan login | No auth |
| `FORBIDDEN` | 403 | Tidak ada akses | No permission |
| `NOT_FOUND` | 404 | Data tidak ditemukan | Resource missing |
| `CONFLICT` | 409 | Data sudah ada | Duplicate entry |
| `RATE_LIMIT` | 429 | Terlalu banyak request | Rate limiting |
| `INTERNAL_ERROR` | 500 | Kesalahan server | Generic error |
| `DATABASE_ERROR` | 500 | Kesalahan database | DB issues |
| `FILE_UPLOAD_ERROR` | 400 | Gagal upload file | Upload issues |
| `NETWORK_ERROR` | 0 | Gagal terhubung | Network issues |
| `TIMEOUT_ERROR` | 504 | Request timeout | Timeout |
| `SESSION_EXPIRED` | 401 | Sesi berakhir | Session expired |
| `PAYMENT_ERROR` | 402 | Kesalahan pembayaran | Payment issues |
| `BOOKING_ERROR` | 400 | Kesalahan booking | Booking issues |

---

## ✅ Files Updated

### Backend APIs (Priority 1 - Critical):
- ✅ `app/api/booking/route.ts` - Booking creation
- ✅ `app/api/booking/[id]/payment/route.ts` - Payment upload
- ✅ `app/api/upload/route.ts` - File upload

### Frontend Pages (Priority 1):
- ✅ `app/booking/page.tsx` - Booking form with comprehensive error handling
- ✅ `app/pelunasan/[id]/page.tsx` - Payment settlement

### Utility Files (New):
- ✅ `lib/error-handler.ts` - Core error handling
- ✅ `lib/api-response.ts` - API response builder
- ✅ `lib/fetch-helper.ts` - Fetch utilities
- ✅ `lib/toast.ts` - Toast notifications
- ✅ `components/ui/error-display.tsx` - Error UI component

---

## 🔒 Security Features

### 1. **Information Hiding**
- Stack traces hanya di development
- Error details hanya di development
- Generic messages di production

### 2. **Input Validation**
- Validation errors dengan field details
- User-friendly validation messages
- Server-side validation enforcement

### 3. **Error Logging**
- Server-side logging untuk semua errors
- Severity-based logging (info, warn, error)
- Context information untuk debugging

### 4. **Rate Limiting Ready**
- Error code untuk rate limiting
- User-friendly rate limit messages

---

## 🎨 User Experience Improvements

### 1. **Visual Feedback**
- Color-coded errors (blue/yellow/red)
- Icons untuk setiap severity level
- Smooth animations

### 2. **Actionable Messages**
- Clear error messages dalam Bahasa Indonesia
- Retry buttons untuk recoverable errors
- Links ke help/support jika diperlukan

### 3. **Loading States**
- Proper loading indicators
- Disabled states saat loading
- Skeleton screens (opsional)

### 4. **Toast Notifications**
- Auto-dismiss untuk success/info
- Longer duration untuk errors
- Dismissible manually

---

## 📊 Monitoring & Debugging

### Development Mode:
- Full error details di console
- Stack traces tersedia
- Error details di UI (collapsible)

### Production Mode:
- User-friendly messages only
- Server-side logging
- Error tracking (siap integrasi dengan Sentry/etc)

### Logging Format:
```
[2026-11-09T04:19:25.163Z] Booking Creation - VALIDATION_ERROR: Data tidak valid
Details: { field: 'carId', message: 'Mobil harus dipilih' }
```

---

## 🚀 Next Steps (Optional Enhancements)

### Priority 2 - Admin Panel:
- [ ] `app/admin/page.tsx` - Replace alerts dengan toast
- [ ] All admin API routes - Standardize responses
- [ ] Admin chat components - Add error feedback

### Priority 3 - User Experience:
- [ ] All landing components - Replace console.error
- [ ] `lib/api.ts` - Add retry logic
- [ ] Error boundary implementation
- [ ] Offline detection

### Advanced Features:
- [ ] Sentry integration untuk error tracking
- [ ] Rate limiting implementation
- [ ] Request ID tracking
- [ ] Performance monitoring

---

## 📖 Usage Examples

### Simple Error Display:
```tsx
<ErrorDisplay error="Gagal memuat data" compact />
```

### With Retry:
```tsx
<ErrorDisplay 
  error={error} 
  onRetry={handleRetry}
/>
```

### With Dismiss:
```tsx
<ErrorDisplay 
  error={error} 
  onDismiss={() => setError(null)}
/>
```

### Toast Notifications:
```tsx
toast.success('Data berhasil disimpan');
toast.error('Gagal menyimpan data');
toast.warning('Sesi akan berakhir dalam 5 menit');
```

---

## 🔍 Testing

### Test Scenarios:
1. ✅ Network errors (offline mode)
2. ✅ Validation errors (invalid input)
3. ✅ Authentication errors (no session)
4. ✅ Authorization errors (wrong permissions)
5. ✅ Database errors (DB down)
6. ✅ File upload errors (size/format)
7. ✅ Timeout errors (slow network)

### Browser Console:
Semua errors logged dengan format:
```
[Timestamp] Context - ErrorCode: Message
```

---

## 💡 Best Practices

1. **Always use ApiResponseBuilder** di API routes
2. **Always handle errors** di fetch calls
3. **Always show user feedback** (toast/error display)
4. **Log errors** dengan context untuk debugging
5. **Use try-catch** untuk semua async operations
6. **Validate input** sebelum processing
7. **Return early** untuk error cases
8. **Don't expose secrets** dalam error messages

---

## 📞 Support

Jika menemukan bug atau butuh bantuan:
1. Check browser console untuk error details
2. Check server logs untuk backend errors
3. Review error code reference di atas
4. Contact development team

---

**Last Updated:** 2026-11-09
**Version:** 1.0.0
**Status:** ✅ Implemented & Tested
