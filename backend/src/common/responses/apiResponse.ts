/**
 * src/common/responses/apiResponse.ts
 *
 * Standardized API envelope response generators matching the VARUNA specification.
 */

export interface ApiResponseMeta {
  version: string;
  timestamp: string;
  requestId: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiResponseMeta;
}

export class ApiResponse {
  /**
   * Generates a standard success response envelope.
   */
  static success<T>(
    data: T,
    message: string,
    requestId: string,
    additionalMeta?: Record<string, unknown>,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId,
        ...additionalMeta,
      },
    };
  }

  /**
   * Generates a standard error response envelope.
   */
  static error(
    code: string,
    message: string,
    requestId: string,
    details?: unknown,
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }
}
