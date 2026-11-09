export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

const ERROR_CODES: Record<string, { message: string; userMessage: string; severity: ErrorSeverity; statusCode: number }> = {
  VALIDATION_ERROR: {
    message: 'Validasi data gagal',
    userMessage: 'Data yang Anda kirim tidak valid. Silakan periksa kembali.',
    severity: 'warning',
    statusCode: 400,
  },
  UNAUTHORIZED: {
    message: 'Autentikasi diperlukan',
    userMessage: 'Silakan login terlebih dahulu.',
    severity: 'warning',
    statusCode: 401,
  },
  FORBIDDEN: {
    message: 'Akses ditolak',
    userMessage: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    severity: 'warning',
    statusCode: 403,
  },
  NOT_FOUND: {
    message: 'Data tidak ditemukan',
    userMessage: 'Maaf, data yang Anda cari tidak ada.',
    severity: 'warning',
    statusCode: 404,
  },
  CONFLICT: {
    message: 'Konflik data',
    userMessage: 'Data yang Anda coba tambahkan sudah ada.',
    severity: 'warning',
    statusCode: 409,
  },
  RATE_LIMIT: {
    message: 'Terlalu banyak permintaan',
    userMessage: 'Anda melakukan terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
    severity: 'warning',
    statusCode: 429,
  },
  INTERNAL_ERROR: {
    message: 'Kesalahan server internal',
    userMessage: 'Terjadi kesalahan pada server kami. Silakan coba lagi nanti.',
    severity: 'error',
    statusCode: 500,
  },
  DATABASE_ERROR: {
    message: 'Kesalahan database',
    userMessage: 'Terjadi kesalahan saat mengakses database. Silakan coba lagi nanti.',
    severity: 'critical',
    statusCode: 500,
  },
  FILE_UPLOAD_ERROR: {
    message: 'Kesalahan upload file',
    userMessage: 'Gagal mengupload file. Pastikan ukuran file tidak melebihi batas dan format benar.',
    severity: 'warning',
    statusCode: 400,
  },
  NETWORK_ERROR: {
    message: 'Kesalahan jaringan',
    userMessage: 'Gagal terhubung ke server. Silakan periksa koneksi internet Anda.',
    severity: 'error',
    statusCode: 0,
  },
  TIMEOUT_ERROR: {
    message: 'Permintaan timeout',
    userMessage: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
    severity: 'warning',
    statusCode: 504,
  },
  SESSION_EXPIRED: {
    message: 'Sesi telah berakhir',
    userMessage: 'Sesi Anda telah berakhir. Silakan login kembali.',
    severity: 'warning',
    statusCode: 401,
  },
  PAYMENT_ERROR: {
    message: 'Kesalahan pembayaran',
    userMessage: 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.',
    severity: 'error',
    statusCode: 402,
  },
  BOOKING_ERROR: {
    message: 'Kesalahan booking',
    userMessage: 'Terjadi kesalahan saat membuat booking. Silakan coba lagi.',
    severity: 'error',
    statusCode: 400,
  },
};

export function createApiError(
  code: keyof typeof ERROR_CODES,
  customMessage?: string,
  details?: Record<string, any>
): ApiError {
  const errorDef = ERROR_CODES[code];
  if (!errorDef) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Kesalahan tidak diketahui',
      userMessage: 'Terjadi kesalahan yang tidak diketahui. Silakan hubungi support.',
      severity: 'error',
      statusCode: 500,
      timestamp: new Date(),
      details,
    };
  }

  return {
    code,
    message: customMessage || errorDef.message,
    userMessage: errorDef.userMessage,
    severity: errorDef.severity,
    statusCode: errorDef.statusCode,
    timestamp: new Date(),
    details,
  };
}

export function parseError(error: unknown): ApiError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('unauthorized') || message.includes('token')) {
      return createApiError('UNAUTHORIZED');
    }
    if (message.includes('forbidden')) {
      return createApiError('FORBIDDEN');
    }
    if (message.includes('not found')) {
      return createApiError('NOT_FOUND');
    }
    if (message.includes('timeout')) {
      return createApiError('TIMEOUT_ERROR');
    }
    if (message.includes('validation')) {
      return createApiError('VALIDATION_ERROR', error.message);
    }
    if (message.includes('database') || message.includes('prisma')) {
      return createApiError('DATABASE_ERROR');
    }

    return createApiError('INTERNAL_ERROR', error.message);
  }

  if (typeof error === 'string') {
    return createApiError('INTERNAL_ERROR', error);
  }

  return createApiError('INTERNAL_ERROR');
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createErrorResponse(error: ApiError): ApiResponse {
  return {
    success: false,
    error,
  };
}

export function logError(error: ApiError, context?: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${context || 'Error'} - ${error.code}: ${error.message}`;

  if (error.severity === 'critical') {
    console.error(logMessage, error.details);
  } else if (error.severity === 'error') {
    console.error(logMessage);
  } else if (error.severity === 'warning') {
    console.warn(logMessage);
  } else {
    console.info(logMessage);
  }
}
