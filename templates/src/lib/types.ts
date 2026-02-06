/**
 * Shared TypeScript types and interfaces
 */

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
    page?: number;
    limit?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * UUID parameter
 */
export interface UUIDParam {
    id: string;
}

/**
 * Environment variables type
 */
export interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    HOST: string;
    DATABASE_URL?: string;
    DB_HOST?: string;
    DB_PORT?: number;
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_SSL?: boolean;
    REDIS_URL?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    AUTH_SECRET?: string;
    LOG_LEVEL?: string;
}

/**
 * Query interface for filtering, sorting, and pagination
 */
export interface IRetrieveQuery {
    page?: number;
    size?: number;
    sort?: string | number | Array<string | object> | object;
    attributes?: string | number | Array<string | object> | object;
    [key: string]: any;
}

/**
 * Authenticated user attached to request after JWT validation
 */
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Extend Fastify request to include authenticated user
 */
declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthenticatedUser;
    }
}
