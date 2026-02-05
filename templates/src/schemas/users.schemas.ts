import { FastifySchema } from 'fastify';
import { emailSchema, uuidParamSchema, paginationSchema } from './common.schemas.js';

/**
 * User validation schemas
 */

/**
 * Create user schema - POST /users
 */
export const createUserSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
            email: emailSchema,
            name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
            },
            age: {
                type: 'number',
                minimum: 0,
                maximum: 150,
            },
        },
        additionalProperties: false,
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        age: { type: 'number' },
                        createdAt: { type: 'string' },
                    },
                },
                timestamp: { type: 'string' },
            },
        },
    },
};

/**
 * Get user by ID schema - GET /users/:id
 */
export const getUserSchema: FastifySchema = {
    params: uuidParamSchema,
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        age: { type: 'number' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                    },
                },
                timestamp: { type: 'string' },
            },
        },
    },
};

/**
 * List users schema - GET /users
 */
export const listUsersSchema: FastifySchema = {
    querystring: paginationSchema,
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string' },
                            name: { type: 'string' },
                            age: { type: 'number' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                    },
                },
                timestamp: { type: 'string' },
            },
        },
    },
};

/**
 * Update user schema - PUT /users/:id
 */
export const updateUserSchema: FastifySchema = {
    params: uuidParamSchema,
    body: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
            },
            age: {
                type: 'number',
                minimum: 0,
                maximum: 150,
            },
        },
        additionalProperties: false,
    },
};

/**
 * Delete user schema - DELETE /users/:id
 */
export const deleteUserSchema: FastifySchema = {
    params: uuidParamSchema,
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'number' },
                message: { type: 'string' },
                timestamp: { type: 'string' },
            },
        },
    },
};
