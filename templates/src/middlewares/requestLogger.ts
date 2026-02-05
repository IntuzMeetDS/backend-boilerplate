import { FastifyInstance } from 'fastify';

/**
 * Request logger middleware
 * 
 * Logs incoming requests and responses
 */
export function requestLoggerMiddleware(server: FastifyInstance): void {
    // Log all requests
    server.addHook('onRequest', async (request, reply) => {
        request.log.info({
            method: request.method,
            url: request.url,
            ip: request.ip,
        }, 'Incoming request');
    });

    // Log all responses
    server.addHook('onResponse', async (request, reply) => {
        request.log.info({
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            responseTime: reply.getResponseTime(),
        }, 'Request completed');
    });
}
