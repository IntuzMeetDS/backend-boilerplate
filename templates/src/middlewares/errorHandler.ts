import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { AppError } from '../lib/errors.js';
import { ApiResponse } from '../lib/responses.js';

/**
 * Global error handler middleware
 * 
 * Handles all errors thrown in the application and returns consistent error responses
 */
export function errorHandlerMiddleware(server: FastifyInstance): void {
    server.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        request.log.error(error);

        // Handle AppError (operational errors)
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send(
                ApiResponse.error(error.message, error.statusCode, error.code, error.details)
            );
        }

        // Handle Fastify validation errors
        if (error.validation) {
            return reply.status(400).send(
                ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', error.validation)
            );
        }

        // Handle unknown errors
        const isDev = process.env.NODE_ENV !== 'production';
        const message = isDev ? error.message : 'Internal server error';
        const details = isDev ? { stack: error.stack } : undefined;

        return reply.status(error.statusCode || 500).send(
            ApiResponse.error(message, error.statusCode || 500, 'INTERNAL_ERROR', details)
        );
    });
}
