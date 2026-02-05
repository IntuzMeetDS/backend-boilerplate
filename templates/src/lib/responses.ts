import { HTTP_STATUS } from './constants.js';

/**
 * Standardized API response interface
 */
export interface ApiResponseData<T = unknown> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    error?: {
        code: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    timestamp: string;
}

/**
 * API Response builder for consistent response structure
 */
export class ApiResponse {
    /**
     * Success response
     */
    static success<T>(
        data: T,
        message = 'Success',
        statusCode: number = HTTP_STATUS.OK,
        meta?: ApiResponseData['meta']
    ): ApiResponseData<T> {
        const response: ApiResponseData<T> = {
            success: true,
            statusCode,
            message,
            data,
            timestamp: new Date().toISOString(),
        };

        if (meta) {
            response.meta = meta;
        }

        return response;
    }

    /**
     * Created response (201)
     */
    static created<T>(data: T, message = 'Resource created successfully'): ApiResponseData<T> {
        return this.success(data, message, HTTP_STATUS.CREATED);
    }

    /**
     * Paginated response
     */
    static paginated<T>(
        data: T[],
        total: number,
        page: number,
        limit: number,
        message = 'Success'
    ): ApiResponseData<T[]> {
        return this.success(data, message, HTTP_STATUS.OK, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    }

    /**
     * Error response
     */
    static error(
        message: string,
        statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code = 'INTERNAL_ERROR',
        details?: unknown
    ): ApiResponseData<null> {
        const response: ApiResponseData<null> = {
            success: false,
            statusCode,
            message,
            error: {
                code,
            },
            timestamp: new Date().toISOString(),
        };

        if (details && response.error) {
            response.error.details = details;
        }

        return response;
    }

    /**
     * No content response (204)
     */
    static noContent(): ApiResponseData<null> {
        return {
            success: true,
            statusCode: HTTP_STATUS.NO_CONTENT,
            message: 'No content',
            timestamp: new Date().toISOString(),
        };
    }
}
