/**
 * Common validation schemas
 * 
 * Reusable validation patterns that can be used across multiple routes
 */

/**
 * Email validation schema
 */
export const emailSchema = {
    type: 'string',
    format: 'email',
    minLength: 5,
    maxLength: 255,
} as const;

/**
 * UUID validation schema
 */
export const uuidSchema = {
    type: 'string',
    format: 'uuid',
} as const;

/**
 * Pagination query parameters schema
 */
export const paginationSchema = {
    type: 'object',
    properties: {
        page: {
            type: 'number',
            minimum: 1,
            default: 1,
        },
        limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 20,
        },
    },
} as const;

/**
 * UUID parameter schema (for route params)
 */
export const uuidParamSchema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: uuidSchema,
    },
} as const;

/**
 * Timestamp schema
 */
export const timestampSchema = {
    type: 'string',
    format: 'date-time',
} as const;

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = {
    type: 'string',
    minLength: 1,
} as const;

/**
 * Positive integer schema
 */
export const positiveIntegerSchema = {
    type: 'number',
    minimum: 1,
} as const;
