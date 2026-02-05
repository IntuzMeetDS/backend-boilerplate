import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../lib/responses.js';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    timestamp: string;
    version: string;
    environment: string;
    services: {
        database: 'connected' | 'disconnected' | 'not_configured';
        cache: 'connected' | 'disconnected' | 'not_configured';
    };
}

/**
 * Health check routes
 * 
 * Provides endpoints for monitoring server health and readiness
 */
export async function healthRoutes(server: FastifyInstance): Promise<void> {
    /**
     * GET /health
     * Main health check endpoint
     */
    server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        const healthData: HealthCheckResponse = {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services: {
                database: process.env.DATABASE_URL ? 'connected' : 'not_configured',
                cache: process.env.REDIS_URL ? 'connected' : 'not_configured',
            },
        };

        reply.send(ApiResponse.success(healthData, 'Server is healthy'));
    });

    /**
     * GET /health/ready
     * Readiness probe for Kubernetes/container orchestration
     */
    server.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
        // Add actual readiness checks here (DB connection, etc.)
        reply.send(ApiResponse.success({ ready: true }, 'Server is ready'));
    });

    /**
     * GET /health/live
     * Liveness probe for Kubernetes/container orchestration
     */
    server.get('/live', async (request: FastifyRequest, reply: FastifyReply) => {
        reply.send(ApiResponse.success({ live: true }, 'Server is alive'));
    });
}
