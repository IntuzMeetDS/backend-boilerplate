import Fastify, { FastifyInstance } from 'fastify';
import { registerMiddlewares } from './middlewares/index.js';
import { registerRoutes } from './routes/index.js';

/**
 * Create and configure Fastify server
 * 
 * @returns Configured Fastify instance
 */
export async function createServer(): Promise<FastifyInstance> {
    const server = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
            transport: process.env.NODE_ENV !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                }
                : undefined,
        },
        trustProxy: true,
        // Request ID generation
        requestIdHeader: 'x-request-id',
        requestIdLogLabel: 'reqId',
    });

    // Register global middlewares (error handler, logger, etc.)
    await registerMiddlewares(server);

    // Register all application routes with API versioning
    await registerRoutes(server);

    // Root endpoint
    server.get('/', async () => {
        return {
            status: 'ok',
            message: 'Backend Core API',
            version: process.env.npm_package_version || '1.0.0',
            apiVersion: 'v1',
            docs: '/api/v1/health',
        };
    });

    return server;
}
