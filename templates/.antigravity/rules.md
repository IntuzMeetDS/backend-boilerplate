# Backend Development Rules

## TypeScript Standards

### Type Safety
- Always use explicit types for function parameters and return values
- Avoid `any` type - use `unknown` for dynamic data
- Use interfaces for object shapes
- Enable strict mode features

### Import Statements
- Use `.js` extensions in imports (TypeScript ESM requirement)
- Example: `import { models } from '../db/models/index.js'`

## Fastify Framework

### Route Structure
- Define routes in `src/routes/` directory
- Use async functions for route plugins
- Include schema validation for all routes
- Apply middleware via `preHandler` array

```typescript
server.post('/', {
    schema: createUserSchema,
    preHandler: [authenticateMiddleware],
    handler: UsersController.create,
});
```

### Controller Pattern
- Place business logic in `src/controllers/`
- Use static methods for controller actions
- Type request/reply with Fastify generics
- Sanitize sensitive data before responses

```typescript
static async getById(
    request: FastifyRequest<{ Params: UUIDParam }>,
    reply: FastifyReply
): Promise<void> {
    // Implementation
}
```

## Error Handling

### Custom Error Classes
Use error classes from `src/lib/errors.ts`:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `TooManyRequestsError` (429)
- `InternalServerError` (500)

```typescript
throw new NotFoundError('User not found');
throw new ValidationError('Invalid input', { field: 'email' });
```

### Error Flow
- Throw errors directly - no try-catch for operational errors
- Global error handler formats errors automatically
- All errors include `statusCode`, `code`, and optional `details`

## Response Format

### Use ApiResponse Helpers
Always use helpers from `src/lib/responses.ts`:

```typescript
// Success
reply.send(ApiResponse.success(data, 'Success message'));

// Created
reply.send(ApiResponse.created(data, 'Resource created'));

// Paginated
reply.send(ApiResponse.paginated(items, total, page, limit));
```

### Standard Response Structure
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

## Database Operations (Sequelize)

### BaseModel Features
All models extend `BaseModel` with advanced filtering:

```typescript
// Parse query filters
const filters = models.User.parseFilters(query, true);
const { rows, count } = await models.User.findAndCountAll(filters);
```

### Filter Operators
- `field__is`: exact match
- `field__con`: contains (case-insensitive)
- `field__sw`: starts with
- `field__ew`: ends with
- `field__gte`: greater than or equal
- `field__lte`: less than or equal
- `field__gt`: greater than
- `field__lt`: less than
- `field__in`: in array (comma-separated)

### Sorting
```typescript
// Query: ?sort=name|created_at-
// Pipe (|) separates fields
// Minus (-) suffix for descending
```

### Pagination
```typescript
// Query: ?page=0&size=10
// Returns results with meta object
// Omit for all records
```

### Field Selection
```typescript
// Query: ?attributes=id|name|email
// Returns only specified fields
```

### Data Sanitization
Always sanitize before sending responses:

```typescript
const user = await models.User.findByPk(id);
user.sanitize(); // Removes sensitive fields
reply.send(ApiResponse.success(user));
```

### Soft Deletes
- Use `model.destroy()` for soft delete
- Sets `deleted_at` timestamp
- Use `paranoid: false` to include deleted records

## Authentication

### Middleware
- `authenticateMiddleware`: Requires authentication
- `optionalAuthMiddleware`: Works with/without auth
- Token format: `Authorization: Bearer <token>`

```typescript
// Protected route
server.get('/protected', {
    preHandler: [authenticateMiddleware],
    handler: async (request, reply) => {
        // request.user available
    }
});

// Optional auth
server.get('/public', {
    preHandler: [optionalAuthMiddleware],
    handler: async (request, reply) => {
        if (request.user) {
            // Authenticated
        } else {
            // Anonymous
        }
    }
});
```

### JWT Utilities
- `generateToken(payload)`: Create token
- `verifyToken(token)`: Verify and decode
- `extractTokenFromHeader(header)`: Extract from header

## Request Validation

### Schema Definition
- Define in `src/schemas/` directory
- Use JSON Schema format
- Validate body, params, querystring, headers
- Include response schemas

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

### Reusable Schemas
Use common schemas from `src/schemas/common.schemas.ts`:
- `emailSchema`
- `uuidParamSchema`
- `paginationSchema`

## API Design

### RESTful Conventions
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Plural nouns: `/users`, `/posts`
- Nested routes: `/users/:id/posts`

### HTTP Status Codes
- 200: Successful GET, PUT, PATCH
- 201: Successful POST
- 204: Successful DELETE
- 400: Invalid input
- 401: Missing/invalid authentication
- 403: Insufficient permissions
- 404: Resource not found
- 409: Resource conflict
- 422: Validation failed
- 429: Rate limit exceeded
- 500: Server error

### Endpoint Naming
- Use kebab-case for multi-word endpoints
- Consistent pluralization
- Version APIs: `/api/v1/users`

## Project Structure

```
src/
├── controllers/     # Business logic
├── routes/          # Route definitions
├── schemas/         # Validation schemas
├── middlewares/     # Custom middleware
├── models/          # Database models
├── lib/             # Utilities and helpers
├── services/        # Third-party integrations
└── assets/          # Static assets
```

## Naming Conventions

- Files: `kebab-case.ts` or `PascalCase.model.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` or `IPascalCase`

## Environment Configuration

### Environment Variables
- Store in `.env` file
- Access via `process.env.VARIABLE_NAME`
- Provide defaults when appropriate
- Document in `.env.example`

### Required Variables
- `NODE_ENV`: Environment mode
- `PORT`: Server port
- `DB_*`: Database credentials
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration

## Performance Optimization

### Database
- Index frequently queried fields
- Select only needed fields with `attributes`
- Use pagination for large datasets
- Avoid N+1 queries with `include`

### Caching
- Use Redis for sessions and caching (if enabled)
- Cache frequently accessed data
- Set appropriate TTL values

## Security Best Practices

- Never log sensitive data (passwords, tokens)
- Sanitize all user input
- Use parameterized queries (Sequelize default)
- Validate input with schemas
- Use HTTPS in production
- Set secure HTTP headers
- Implement rate limiting
- Store secrets in environment variables
- Hash passwords with bcrypt (10-12 rounds)

## Logging

- Use appropriate levels: error, warn, info, debug
- Log errors with stack traces
- Log requests/responses in development
- Never log sensitive data

## Code Documentation

### Comments
- Use JSDoc for functions and classes
- Document complex logic and business rules
- Keep comments synchronized with code
- Explain "why" not "what"

### API Documentation
- Document endpoints with schemas
- Include example requests/responses
- Document query parameters
- Use OpenAPI/Swagger for documentation

## Testing

- Place tests near source files or in `__tests__`
- Use descriptive test names
- Test happy paths and error cases
- Mock external dependencies
