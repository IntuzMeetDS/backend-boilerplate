import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
    createUserSchema,
    getUserSchema,
    listUsersSchema,
    updateUserSchema,
    deleteUserSchema,
} from '../schemas/users.schemas.js';
import { ApiResponse } from '../lib/responses.js';
import { UsersController } from '../controllers/users.controller.js';

/**
 * User routes
 * 
 * Demonstrates both inline handlers (for simple logic) and controller usage (for complex logic)
 */
export async function userRoutes(server: FastifyInstance): Promise<void> {
    /**
     * POST /users
     * Create a new user
     * 
     * Example of inline handler for simple logic
     */
    server.post('/', {
        schema: createUserSchema,
        handler: async (request: FastifyRequest<{ Body: { email: string; name: string; age?: number } }>, reply: FastifyReply) => {
            const userData = request.body;

            // TODO: Replace with actual database creation
            // Example: const user = await User.create(userData);

            // Mock created user
            const user = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                ...userData,
                createdAt: new Date().toISOString(),
            };

            reply.status(201).send(ApiResponse.created(user, 'User created successfully'));
        },
    });

    /**
     * GET /users/:id
     * Get user by ID
     * 
     * Example of using controller for more complex logic
     */
    server.get('/:id', {
        schema: getUserSchema,
        handler: UsersController.getById,
    });

    /**
     * GET /users
     * List users with pagination
     * 
     * Example of using controller for pagination logic
     */
    server.get('/', {
        schema: listUsersSchema,
        handler: UsersController.list,
    });

    /**
     * PUT /users/:id
     * Update user
     */
    server.put('/:id', {
        schema: updateUserSchema,
        handler: UsersController.update,
    });

    /**
     * DELETE /users/:id
     * Delete user
     */
    server.delete('/:id', {
        schema: deleteUserSchema,
        handler: UsersController.delete,
    });
}
