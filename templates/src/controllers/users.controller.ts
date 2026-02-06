import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse } from '../lib/responses.js';
import { NotFoundError } from '../lib/errors.js';
import { UUIDParam, IRetrieveQuery } from '../lib/types.js';
import { models } from '../db/models/index.js';

/**
 * Users controller
 * 
 * Handles business logic for user-related operations
 * Demonstrates BaseModel features: filtering, sorting, pagination
 * 
 * Query examples:
 * - GET /users (returns all users, no pagination)
 * - GET /users?page=0&size=10 (returns paginated results with meta)
 * - GET /users?status__is=1 (filter all users by status)
 * - GET /users?page=0&size=10&status__is=1 (paginated + filtered)
 * - GET /users?name__con=john (search by name)
 * - GET /users?sort=name|created_at- (sort by name asc, created_at desc)
 * - GET /users?attributes=id|name|email (select specific fields)
 */
export class UsersController {
    /**
     * GET /users/:id
     * Get user by ID with optional attribute selection
     * 
     * Query examples:
     * - /users/:id
     * - /users/:id?attributes=id|name|email
     */
    static async getById(
        request: FastifyRequest<{ 
            Params: UUIDParam;
            Querystring: IRetrieveQuery;
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params;
        const query = request.query;

        // Parse filters without pagination
        const filters = models.User.parseFilters(query, false);
        
        const user = await models.User.findByPk(id, filters);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Sanitize sensitive data
        user.sanitize();

        reply.send(ApiResponse.success(user, 'User retrieved successfully'));
    }

    /**
     * GET /users
     * List users with advanced filtering, sorting, and optional pagination
     * 
     * Pagination behavior:
     * - If BOTH page and size are provided: returns paginated results with meta
     * - If neither is provided: returns all records without meta
     * 
     * Supported query parameters:
     * - page: Page number (0-indexed, optional)
     * - size: Items per page (optional)
     * - sort: Sort fields (e.g., name|created_at-)
     * - attributes: Select specific fields (e.g., id|name|email)
     * - status__is: Filter by status
     * - name__con: Search by name (contains)
     * - email__sw: Filter by email (starts with)
     * - age__gte: Filter by age (greater than or equal)
     * - age__lte: Filter by age (less than or equal)
     * - created_at__is: Filter by creation date
     */
    static async list(
        request: FastifyRequest<{ Querystring: IRetrieveQuery }>,
        reply: FastifyReply
    ): Promise<void> {
        const query = request.query;
        
        // Parse filters with pagination enabled
        const filters = models.User.parseFilters(query, true);
        
        // Execute query with count
        const { rows: users, count } = await models.User.findAndCountAll(filters);
        
        // Sanitize sensitive data from each user
        users.forEach(user => user.sanitize());
        
        // Check if pagination was requested
        const hasPagination = query.page !== undefined && query.size !== undefined;
        
        if (hasPagination) {
            const page = Number(query.page);
            const size = Number(query.size);
            const meta = {
                page: page + 1, // Return 1-indexed page for API response
                limit: size,
                total: count,
                totalPages: Math.ceil(count / size),
            };
            reply.send(ApiResponse.success(users, 'Users retrieved successfully', 200, meta));
        } else {
            // No pagination - return all records
            reply.send(ApiResponse.success(users, 'Users retrieved successfully'));
        }
    }

    /**
     * POST /users
     * Create new user
     */
    static async create(
        request: FastifyRequest<{ Body: { email: string; name: string; age?: number } }>,
        reply: FastifyReply
    ): Promise<void> {
        const user = await models.User.create(request.body);
        
        // Sanitize sensitive data
        user.sanitize();
        
        reply.status(201).send(ApiResponse.success(user, 'User created successfully'));
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

        const user = await models.User.findByPk(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.update(updateData);
        
        // Sanitize sensitive data
        user.sanitize();

        reply.send(ApiResponse.success(user, 'User updated successfully'));
    }

    /**
     * DELETE /users/:id
     * Delete user (soft delete)
     */
    static async delete(
        request: FastifyRequest<{ Params: UUIDParam }>,
        reply: FastifyReply
    ): Promise<void> {
        const { id } = request.params;

        const user = await models.User.findByPk(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Soft delete (sets deleted_at timestamp)
        await user.destroy();

        reply.send(ApiResponse.success({ id }, 'User deleted successfully'));
    }
}
