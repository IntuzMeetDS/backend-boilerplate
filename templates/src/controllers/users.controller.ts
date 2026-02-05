import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../lib/responses.js';
import { NotFoundError } from '../lib/errors.js';
import { UUIDParam, PaginationQuery } from '../lib/types.js';

/**
 * Users controller
 * 
 * Handles business logic for user-related operations
 * Use controllers when route handlers become complex (50+ lines)
 */
export class UsersController {
    /**
     * GET /users/:id
     * Get user by ID
     */
    static async getById(
        request: FastifyRequest<{ Params: UUIDParam }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params;

        // TODO: Replace with actual database query
        // Example: const user = await User.findByPk(id);
        
        // Mock data for example
        const user = {
            id,
            email: 'user@example.com',
            name: 'John Doe',
            age: 30,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (!user) {
            throw new NotFoundError('User not found');
        }

        reply.send(ApiResponse.success(user, 'User retrieved successfully'));
    }

    /**
     * GET /users
     * List users with pagination
     */
    static async list(
        request: FastifyRequest<{ Querystring: PaginationQuery }>,
        reply: FastifyReply
    ): Promise<void> {
        const { page = 1, limit = 20 } = request.query;

        // TODO: Replace with actual database query
        // Example: const { rows, count } = await User.findAndCountAll({ limit, offset: (page - 1) * limit });

        // Mock data for example
        const users = [
            {
                id: '550e8400-e29b-41d4-a716-446655440000',
                email: 'user1@example.com',
                name: 'John Doe',
                age: 30,
                createdAt: new Date().toISOString(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                email: 'user2@example.com',
                name: 'Jane Smith',
                age: 25,
                createdAt: new Date().toISOString(),
            },
        ];

        const total = 50; // Mock total count

        reply.send(ApiResponse.paginated(users, total, page, limit, 'Users retrieved successfully'));
    }

    /**
     * PUT /users/:id
     * Update user
     */
    static async update(
        request: FastifyRequest<{ Params: UUIDParam; Body: { name?: string; age?: number } }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params;
        const updateData = request.body;

        // TODO: Replace with actual database update
        // Example: await User.update(updateData, { where: { id } });

        const updatedUser = {
            id,
            ...updateData,
            updatedAt: new Date().toISOString(),
        };

        reply.send(ApiResponse.success(updatedUser, 'User updated successfully'));
    }

    /**
     * DELETE /users/:id
     * Delete user
     */
    static async delete(
        request: FastifyRequest<{ Params: UUIDParam }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params;

        // TODO: Replace with actual database deletion
        // Example: await User.destroy({ where: { id } });

        reply.send(ApiResponse.success({ id }, 'User deleted successfully'));
    }
}
