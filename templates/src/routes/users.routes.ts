import { FastifyInstance } from 'fastify';
import {
    createUserSchema,
    getUserSchema,
    listUsersSchema,
    updateUserSchema,
    deleteUserSchema,
} from '../schemas/users.schemas.js';
import { UsersController } from '../controllers/users.controller.js';
import { authenticateMiddleware } from '../middlewares/index.js';

/**
 * User routes
 * 
 * Demonstrates both inline handlers (for simple logic) and controller usage (for complex logic)
 */
export async function userRoutes(server: FastifyInstance): Promise<void> {
    /**
     * POST /users
     * Create a new user
     */
    server.post('/', {
        schema: createUserSchema,
        preHandler: [authenticateMiddleware],
        handler: UsersController.create,
    });

    /**
     * GET /users/:id
     * Get user by ID
     * 
     * Example of using controller for more complex logic
     */
    server.get('/:id', {
        schema: getUserSchema,
        preHandler: [authenticateMiddleware],
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
        preHandler: [authenticateMiddleware],
        handler: UsersController.list,
    });

    /**
     * PUT /users/:id
     * Update user
     */
    server.put('/:id', {
        schema: updateUserSchema,
        preHandler: [authenticateMiddleware],
        handler: UsersController.update,
    });

    /**
     * DELETE /users/:id
     * Delete user
     */
    server.delete('/:id', {
        schema: deleteUserSchema,
        preHandler: [authenticateMiddleware],
        handler: UsersController.delete,
    });
}
