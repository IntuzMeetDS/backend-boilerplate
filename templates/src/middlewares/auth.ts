import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, extractTokenFromHeader } from '../lib/jwt.js';
import { UnauthorizedError } from '../lib/errors.js';
import { models } from '../db/models/index.js';
import { AuthenticatedUser } from '../lib/types.js';

/**
 * Authentication middleware
 * 
 * Validates JWT token from Authorization header and attaches user to request
 * 
 * @throws UnauthorizedError if token is missing, invalid, or user not found
 */
export async function authenticateMiddleware(
    request: FastifyRequest
): Promise<void> {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        throw new UnauthorizedError('Authentication required');
    }

    // Verify token and get payload
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await models.User.findByPk(decoded.id);

    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
    } as AuthenticatedUser;
}

/**
 * Optional authentication middleware
 * 
 * Validates JWT token if present and attaches user to request
 * Does NOT throw error if token is missing - allows anonymous access
 * Useful for routes that work for both authenticated and anonymous users
 * 
 * @example
 * // Route accessible to both authenticated and anonymous users
 * server.get('/posts', {
 *     preHandler: [optionalAuthMiddleware],
 *     handler: async (request, reply) => {
 *         if (request.user) {
 *             // User is authenticated - show personalized content
 *         } else {
 *             // Anonymous user - show public content
 *         }
 *     }
 * });
 */
export async function optionalAuthMiddleware(
    request: FastifyRequest
): Promise<void> {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        // If no token, just continue without attaching user
        if (!token) {
            return;
        }

        // Verify token and get payload
        const decoded = verifyToken(token);

        // Fetch user from database
        const user = await models.User.findByPk(decoded.id);

        // If user found, attach to request
        if (user) {
            request.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at,
            } as AuthenticatedUser;
        }
    } catch (error) {
        // Silently ignore auth errors for optional auth
        // request.user will remain undefined
    }
}
