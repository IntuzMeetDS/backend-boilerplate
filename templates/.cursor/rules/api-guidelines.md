# Backend API Guidelines

## TypeScript Best Practices

### Type Safety
- Always use explicit types for function parameters and return values
- Avoid using `any` type - use `unknown` for truly dynamic data
- Use interfaces for object shapes and types for unions/primitives
- Leverage TypeScript's strict mode features

### Imports
- Use `.js` extensions in import statements (TypeScript ESM requirement)
- Example: `import { models } from '../db/models/index.js'`

## Fastify Patterns

### Route Definitions
- Define routes in separate route files under `src/routes/`
- Use async functions for route plugins
- Always include schema validation for routes
- Use `preHandler` for middleware (e.g., authentication)

```typescript
server.post('/', {
    schema: createUserSchema,
    preHandler: [authenticateMiddleware],
    handler: UsersController.create,
});
```

### Controllers
- Place business logic in controllers under `src/controllers/`
- Use static methods for controller actions
- Type request/reply with Fastify generics
- Always sanitize sensitive data before sending responses

```typescript
static async getById(
    request: FastifyRequest<{ Params: UUIDParam }>,
    reply: FastifyReply
): Promise<void> {
    // Controller logic
}
```

## Error Handling

### Custom Error Classes
- Use custom error classes from `src/lib/errors.ts`
- Available errors: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `TooManyRequestsError`, `InternalServerError`
- All errors extend `AppError` with `statusCode`, `code`, and optional `details`

```typescript
throw new NotFoundError('User not found');
throw new ValidationError('Invalid input', { field: 'email' });
```

### Error Middleware
- Errors are automatically caught by the global error handler
- Never use `try-catch` for operational errors - throw directly
- The error handler will format errors using `ApiResponse.error()`

## Response Formatting

### Standard Response Structure
- Always use `ApiResponse` helpers from `src/lib/responses.ts`
- Never manually construct response objects

```typescript
// Success responses
reply.send(ApiResponse.success(data, 'Success message'));
reply.send(ApiResponse.created(data, 'Resource created'));

// Paginated responses
reply.send(ApiResponse.paginated(items, total, page, limit));

// Error responses (handled by error middleware)
throw new NotFoundError('Resource not found');
```

### Response Structure
All responses follow this format:
```typescript
{
    success: boolean,
    statusCode: number,
    message: string,
    data?: T,
    error?: { code: string, details?: unknown },
    meta?: { page, limit, total, totalPages },
    timestamp: string
}
```

## Database Patterns (Sequelize)

### Model Usage
- All models extend `BaseModel` which provides advanced filtering, sorting, and pagination
- Use `models.ModelName` from `src/db/models/index.ts`
- Always use `findByPk`, `findOne`, `findAll`, `findAndCountAll`

### Query Filtering
The `BaseModel.parseFilters()` method supports advanced filtering:

```typescript
// Parse filters with pagination
const filters = models.User.parseFilters(query, true);
const { rows, count } = await models.User.findAndCountAll(filters);

// Supported filter operators:
// - field__is: exact match
// - field__con: contains (case-insensitive)
// - field__sw: starts with
// - field__ew: ends with
// - field__gte: greater than or equal
// - field__lte: less than or equal
// - field__gt: greater than
// - field__lt: less than
// - field__in: in array (comma-separated)
```

### Sorting
```typescript
// Query: ?sort=name|created_at-
// Sorts by name ASC, then created_at DESC
// Use pipe (|) to separate fields
// Use minus (-) suffix for descending order
```

### Pagination
```typescript
// Query: ?page=0&size=10
// Returns paginated results with meta object
// If page/size not provided, returns all records
```

### Attribute Selection
```typescript
// Query: ?attributes=id|name|email
// Returns only specified fields
// Use pipe (|) to separate field names
```

### Soft Deletes
- Models support soft deletes via `deleted_at` timestamp
- Use `model.destroy()` for soft delete
- Use `paranoid: false` in query options to include deleted records

### Data Sanitization
- Always call `model.sanitize()` before sending responses
- Removes sensitive fields like `password`, `password_hash`, etc.

```typescript
const user = await models.User.findByPk(id);
user.sanitize();
reply.send(ApiResponse.success(user));
```

## Authentication

### JWT Middleware
- Use `authenticateMiddleware` for protected routes
- Use `optionalAuthMiddleware` for routes that work with/without auth
- Token format: `Authorization: Bearer <token>`

```typescript
// Protected route
server.get('/protected', {
    preHandler: [authenticateMiddleware],
    handler: async (request, reply) => {
        // request.user is available
    }
});

// Optional auth route
server.get('/public', {
    preHandler: [optionalAuthMiddleware],
    handler: async (request, reply) => {
        if (request.user) {
            // Authenticated user
        } else {
            // Anonymous user
        }
    }
});
```

### JWT Utilities
- `generateToken(payload)`: Create JWT token
- `verifyToken(token)`: Verify and decode token
- `extractTokenFromHeader(header)`: Extract token from Authorization header

## Request Validation

### Schema Definition
- Define schemas in `src/schemas/` directory
- Use JSON Schema format (Fastify's native validation)
- Validate body, params, querystring, and headers
- Define response schemas for documentation

```typescript
export const createUserSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
            email: emailSchema,
            name: { type: 'string', minLength: 2, maxLength: 100 }
        },
        additionalProperties: false
    },
    response: {
        201: { /* response schema */ }
    }
};
```

### Common Schemas
- Reuse common schemas from `src/schemas/common.schemas.ts`
- Available: `emailSchema`, `uuidParamSchema`, `paginationSchema`

## API Design

### RESTful Conventions
- Use proper HTTP methods: GET, POST, PUT, PATCH, DELETE
- Use plural nouns for resources: `/users`, `/posts`
- Use nested routes for relationships: `/users/:id/posts`

### Status Codes
- 200 OK: Successful GET, PUT, PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing/invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict (e.g., duplicate email)
- 422 Validation Error: Schema validation failed
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

### Endpoint Naming
- Use kebab-case for multi-word endpoints
- Be consistent with pluralization
- Version APIs if needed: `/api/v1/users`

## Code Organization

### File Structure
```
src/
├── controllers/     # Business logic
├── routes/          # Route definitions
├── schemas/         # Validation schemas
├── middlewares/     # Custom middleware
├── models/          # Database models
├── lib/             # Utilities and helpers
├── services/        # Third-party integrations
└── assets/          # Static assets (locales, etc.)
```

### Naming Conventions
- Files: `kebab-case.ts` or `PascalCase.model.ts`
- Classes: `PascalCase`
- Functions/Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` or `IPascalCase`

## Environment Variables

### Configuration
- Store sensitive data in `.env` file
- Use `process.env.VARIABLE_NAME` to access
- Provide defaults in code when appropriate
- Document all variables in `.env.example`

### Required Variables
- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port
- `DB_*`: Database connection details
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time

## Testing

### Test Structure
- Place tests next to source files or in `__tests__` directory
- Use descriptive test names
- Test happy paths and error cases
- Mock external dependencies

## Performance

### Database Optimization
- Use indexes on frequently queried fields
- Use `attributes` to select only needed fields
- Use pagination for large datasets
- Avoid N+1 queries - use `include` for associations

### Caching
- Use Redis for session storage and caching (if enabled)
- Cache frequently accessed data
- Set appropriate TTL values

## Security

### Best Practices
- Never log sensitive data (passwords, tokens)
- Always sanitize user input
- Use parameterized queries (Sequelize handles this)
- Validate all input with schemas
- Use HTTPS in production
- Set secure HTTP headers
- Implement rate limiting
- Use environment variables for secrets

### Password Handling
- Never store plain text passwords
- Use bcrypt for password hashing
- Set appropriate salt rounds (10-12)

## Logging

### Log Levels
- Use appropriate log levels: error, warn, info, debug
- Log errors with stack traces
- Log request/response in development
- Avoid logging sensitive data

## Documentation

### Code Comments
- Use JSDoc comments for functions and classes
- Document complex logic and business rules
- Keep comments up to date with code changes
- Explain "why" not "what"

### API Documentation
- Document all endpoints with schemas
- Include example requests/responses
- Document query parameters and filters
- Use OpenAPI/Swagger for API documentation
