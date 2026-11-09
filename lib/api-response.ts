import { NextResponse } from 'next/server';
import { ApiError, createApiError, logError } from './error-handler';

export class ApiResponseBuilder {
  static success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static error(
    code: string,
    customMessage?: string,
    details?: Record<string, any>,
    context?: string
  ): NextResponse {
    const error = createApiError(code as any, customMessage, details);
    logError(error, context);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.userMessage,
          details: process.env.NODE_ENV === 'development' ? details : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  static validationError(message: string, fields?: Record<string, string>): NextResponse {
    return this.error('VALIDATION_ERROR', message, { fields }, 'Validation');
  }

  static unauthorized(message?: string): NextResponse {
    return this.error('UNAUTHORIZED', message, undefined, 'Auth');
  }

  static forbidden(message?: string): NextResponse {
    return this.error('FORBIDDEN', message, undefined, 'Auth');
  }

  static notFound(resource: string): NextResponse {
    return this.error('NOT_FOUND', `${resource} tidak ditemukan`, undefined, 'NotFound');
  }

  static internalError(error: unknown, context?: string): NextResponse {
    const apiError = createApiError('INTERNAL_ERROR');
    logError(apiError, context);

    if (error instanceof Error) {
      console.error(`[${context || 'Internal Error'}]`, error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.userMessage,
          details: process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  static databaseError(error: unknown): NextResponse {
    return this.error('DATABASE_ERROR', undefined, undefined, 'Database');
  }
}

export function handleApiError(error: unknown, context?: string): NextResponse {
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized') || error.message.includes('token')) {
      return ApiResponseBuilder.unauthorized();
    }
    if (error.message.includes('Forbidden')) {
      return ApiResponseBuilder.forbidden();
    }
    if (error.message.includes('not found')) {
      return ApiResponseBuilder.notFound('Resource');
    }
    if (error.message.includes('Prisma') || error.message.includes('database')) {
      return ApiResponseBuilder.databaseError(error);
    }
  }

  return ApiResponseBuilder.internalError(error, context);
}
