import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { userRoutes } from './users.routes.js';

/**
 * Register all application routes
 * 
 * This is the central place where all routes are registered with their prefixes
 */
export async function registerRoutes(server: FastifyInstance): Promise<void> {
    // Health check routes - /api/v1/health
    await server.register(healthRoutes, { prefix: '/api/v1/health' });

    // User routes - /api/v1/users
    await server.register(userRoutes, { prefix: '/api/v1/users' });

    // Add more route registrations here as your application grows
    // Example:
    // await server.register(authRoutes, { prefix: '/api/v1/auth' });
    // await server.register(postsRoutes, { prefix: '/api/v1/posts' });
}
