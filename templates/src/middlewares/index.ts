import { FastifyInstance } from 'fastify';
import { errorHandlerMiddleware } from './errorHandler.js';
import { requestLoggerMiddleware } from './requestLogger.js';

/**
 * Register all global middlewares
 */
export async function registerMiddlewares(server: FastifyInstance): Promise<void> {
    // Error handler (should be registered first)
    errorHandlerMiddleware(server);

    // Request logger
    requestLoggerMiddleware(server);

    // Add more middlewares here as needed:
    // - CORS
    // - Rate limiting
    // - Authentication
    // - Request validation
}

export { errorHandlerMiddleware } from './errorHandler.js';
export { requestLoggerMiddleware } from './requestLogger.js';
