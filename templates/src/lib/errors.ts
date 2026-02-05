/**
 * Custom application error class with status codes and error codes
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details?: unknown
    ) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);

        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON(): Record<string, unknown> {
        const result: Record<string, unknown> = {
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
        };

        if (this.details !== undefined) {
            result.details = this.details;
        }

        return result;
    }
}

/**
 * Factory functions for common errors
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: unknown) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: unknown) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: unknown) {
        super(message, 403, 'FORBIDDEN', details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: unknown) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict', details?: unknown) {
        super(message, 409, 'CONFLICT', details);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', details?: unknown) {
        super(message, 422, 'VALIDATION_ERROR', details);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message: string = 'Too many requests', details?: unknown) {
        super(message, 429, 'TOO_MANY_REQUESTS', details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: unknown) {
        super(message, 500, 'INTERNAL_ERROR', details);
    }
}
