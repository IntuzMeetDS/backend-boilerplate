# Architecture & Structure Guide

This document explains the architectural decisions, folder structure, and design patterns used in this boilerplate.

## Design Philosophy

### Core Principles

1. **Simplicity First** - Start minimal, grow as needed
2. **Flat Structure** - Reduce nesting, improve discoverability
3. **Type Safety** - Leverage TypeScript strictly
4. **Scalability** - Clear extension points for growth
5. **Production Ready** - Include essential features from day one

### MVP to Enterprise

This boilerplate is designed to work for:

- **MVP Projects**: Simple, fast to understand, no over-engineering
- **Enterprise Apps**: Clear patterns for scaling (controllers, services, versioning)

## Folder Structure Explained

### `/src/routes/`

**Purpose**: API route definitions

**Pattern**: One file per resource

```
routes/
├── index.ts           # Central route registration
├── health.routes.ts   # Health checks
└── users.routes.ts    # User CRUD
```

**When to split**: When a single route file exceeds 200 lines, consider:
- Extracting logic to controllers
- Splitting into sub-resources

### `/src/schemas/`

**Purpose**: Validation schemas organized by feature

**Pattern**: Fastify JSON Schema format

```
schemas/
├── common.schemas.ts  # Reusable patterns (email, UUID, pagination)
└── users.schemas.ts   # User-specific validations
```

**Benefits**:
- Co-located with related routes
- Easy to find and update
- Reusable patterns in `common.schemas.ts`

### `/src/controllers/`

**Purpose**: Business logic (optional, use when needed)

**When to use**:
- Route handler > 50 lines
- Complex business logic
- Multiple operations on same resource

**When NOT to use**:
- Simple CRUD operations
- Direct database queries
- One-liner handlers

```typescript
// ❌ Don't create controller for this
server.get('/', async () => {
  return ApiResponse.success({ status: 'ok' });
});

// ✅ Do create controller for this
server.post('/', {
  handler: UsersController.create  // 100+ lines of logic
});
```

### `/src/middlewares/`

**Purpose**: Global request/response processing

**Included**:
- `errorHandler.ts` - Global error handling
- `requestLogger.ts` - Request/response logging
- `index.ts` - Middleware registration

**Adding new middleware**:

```typescript
// src/middlewares/auth.middleware.ts
export function authMiddleware(server: FastifyInstance) {
  server.addHook('onRequest', async (request, reply) => {
    // Authentication logic
  });
}

// src/middlewares/index.ts
import { authMiddleware } from './auth.middleware.js';
authMiddleware(server);
```

### `/src/lib/`

**Purpose**: Core utilities and helpers

**Files**:
- `errors.ts` - Custom error classes
- `responses.ts` - Standardized response builders
- `constants.ts` - Application constants
- `types.ts` - Shared TypeScript types
- `utils.ts` - Helper functions (keep minimal)

**Philosophy**: Keep this folder lean. Add utilities only when actually needed.

### `/src/db/`

**Purpose**: Database layer (Sequelize)

```
db/
├── config.ts          # Sequelize configuration
├── models/
│   ├── index.ts       # Model registry & associations
│   └── User.model.ts  # Example model
├── migrations/        # Database migrations
└── seeders/           # Seed data
```

**Model Pattern**:

```typescript
// Define attributes interface
export interface UserAttributes { ... }

// Extend Sequelize Model
export class User extends Model<UserAttributes> { ... }

// Initialize function
export const initUserModel = (sequelize: Sequelize) => { ... }
```

### `/src/assets/`

**Purpose**: Non-compilable assets

```
assets/
├── locales/          # i18n translation files
└── templates/        # Email/notification templates
```

## Key Design Patterns

### 1. Error Handling

**Pattern**: Throw custom errors, let middleware handle

```typescript
// In route/controller
if (!user) {
  throw new NotFoundError('User not found');
}

// Global error handler catches and formats
// No need to manually send error responses
```

**Error Classes**:
- `AppError` - Base class
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `TooManyRequestsError` (429)
- `InternalServerError` (500)

### 2. Response Format

**Pattern**: Use `ApiResponse` class for all responses

```typescript
// Success
return ApiResponse.success(data, 'Message');

// Created (201)
return ApiResponse.created(data, 'Resource created');

// Paginated
return ApiResponse.paginated(items, total, page, limit);

// Error (handled by middleware)
return ApiResponse.error(message, statusCode, code);
```

**Standard Format**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Validation

**Pattern**: Define schemas separately, apply at route level

```typescript
// schemas/users.schemas.ts
export const createUserSchema: FastifySchema = { ... };

// routes/users.routes.ts
server.post('/', {
  schema: createUserSchema,  // Validation applied here
  handler: async (req, reply) => {
    // req.body is already validated
  }
});
```

**Benefits**:
- Automatic validation
- Type inference
- Clear separation of concerns
- Reusable schemas

### 4. API Versioning

**Current**: All routes use `/api/v1` prefix

```typescript
// src/routes/index.ts
await server.register(userRoutes, { prefix: '/api/v1/users' });
```

**Migration to v2**:

**Option A: Separate files**

```
routes/
├── users.routes.ts      # v1
└── users.v2.routes.ts   # v2

// Register both
await server.register(userRoutes, { prefix: '/api/v1/users' });
await server.register(userRoutesV2, { prefix: '/api/v2/users' });
```

**Option B: Folder structure**

```
routes/
├── v1/
│   └── users.routes.ts
└── v2/
    └── users.routes.ts
```

## Growth Patterns

### Stage 1: MVP (Current)

```
routes/users.routes.ts
  └─ Inline handlers (simple logic)
```

**Characteristics**:
- All logic in route handlers
- Direct database queries
- Fast to build and understand

### Stage 2: Growing App

```
routes/users.routes.ts
  └─ controllers/users.controller.ts
       └─ Complex business logic
```

**When to upgrade**:
- Route handlers > 50 lines
- Shared logic between routes
- Complex validations

### Stage 3: Enterprise

```
routes/users.routes.ts
  └─ controllers/users.controller.ts
       └─ services/users.service.ts
            └─ db/models/User.model.ts
```

**When to upgrade**:
- Multiple controllers share logic
- External API integrations
- Complex data transformations
- Microservices preparation

### Adding Service Layer

Create `src/services/` when needed:

```typescript
// src/services/users.service.ts
export class UsersService {
  static async create(data: CreateUserDto) {
    // Business logic
    // Data validation
    // External API calls
    return await User.create(data);
  }
}

// src/controllers/users.controller.ts
export class UsersController {
  static async create(req, reply) {
    const user = await UsersService.create(req.body);
    return ApiResponse.created(user);
  }
}
```

## Database Patterns

### Model Definition

```typescript
// 1. Define attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  name: string;
}

// 2. Extend Model with attributes
export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string;
}

// 3. Initialize model
export const initUserModel = (sequelize: Sequelize) => {
  User.init({ ... }, { sequelize, tableName: 'users' });
  return User;
};
```

### Associations

Define in `src/db/models/index.ts`:

```typescript
export const initializeAssociations = () => {
  models.User.hasMany(models.Post, { foreignKey: 'userId' });
  models.Post.belongsTo(models.User, { foreignKey: 'userId' });
};
```

### Migrations vs Sync

**Development**: Use `sync()` for rapid prototyping

```typescript
await syncModels(true); // Drops and recreates tables
```

**Production**: Always use migrations

```bash
npm run db:migrate
```

## Configuration Management

### Environment Variables

**Pattern**: Load via `dotenv`, access via `process.env`

```typescript
// src/start.ts
import 'dotenv/config';

const PORT = parseIntSafe(process.env.PORT, 3000);
```

**Type Safety**:

```typescript
// src/lib/types.ts
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL?: string;
}
```

## Testing Strategy

### Unit Tests

Test individual functions:

```typescript
// lib/utils.test.ts
import { parseIntSafe } from './utils';

test('parseIntSafe returns fallback for invalid input', () => {
  expect(parseIntSafe('invalid', 10)).toBe(10);
});
```

### Integration Tests

Test API endpoints:

```typescript
// routes/users.test.ts
test('POST /api/v1/users creates user', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/api/v1/users',
    payload: { email: 'test@example.com', name: 'Test' }
  });
  expect(response.statusCode).toBe(201);
});
```

## Security Considerations

### Input Validation

✅ All inputs validated via JSON schemas  
✅ Additional validation in models  
✅ Type safety via TypeScript

### Error Handling

✅ No sensitive data in error messages  
✅ Different error details for dev vs production  
✅ Proper HTTP status codes

### Database

✅ Parameterized queries (Sequelize)  
✅ Connection pooling  
✅ SSL support for production

## Performance Optimization

### Current Optimizations

- Fastify (faster than Express)
- Connection pooling
- Efficient logging (Pino)
- Type checking at build time

### Future Optimizations

Add when needed:
- Redis caching
- Response compression
- Rate limiting
- Database query optimization
- CDN for static assets

## Monitoring & Logging

### Logging Levels

```typescript
server.log.info('Info message');
server.log.error('Error message');
server.log.debug('Debug message');
```

### Request Logging

Automatic via `requestLogger` middleware:
- Request method, URL, IP
- Response status, time
- Request ID for tracing

### Health Checks

Three endpoints for monitoring:

```
GET /api/v1/health       # Overall health
GET /api/v1/health/ready # Readiness probe (K8s)
GET /api/v1/health/live  # Liveness probe (K8s)
```

## Deployment

### Build Process

```bash
npm run build  # Compiles TypeScript to dist/
```

### Environment Setup

```bash
export NODE_ENV=production
export DATABASE_URL=postgresql://...
```

### Running

```bash
npm start  # Runs compiled code from dist/
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/start.js"]
```

## Migration from Old Structure

If migrating from the old nested structure:

### Old → New Mapping

```
src/server/rest/v1/routes/     → src/routes/
src/server/rest/v1/controllers → src/controllers/
src/common/                    → src/lib/
src/storage/                   → src/db/
types/                         → src/lib/types.ts
```

### Key Changes

1. **Flatter structure** - Less nesting
2. **Schemas folder** - Dedicated validation
3. **Optional controllers** - Use when needed
4. **Simplified imports** - Shorter paths

## Best Practices Summary

✅ **Keep it simple** - Don't add complexity until needed  
✅ **Type everything** - Leverage TypeScript fully  
✅ **Validate early** - At route level, not in business logic  
✅ **Handle errors centrally** - Use custom error classes  
✅ **Log appropriately** - Info in prod, debug in dev  
✅ **Version your API** - Plan for future changes  
✅ **Document as you go** - Update README when adding features  
✅ **Test critical paths** - Focus on business logic  

## Questions?

This structure is designed to be intuitive. If something is unclear:

1. Check the example implementations (health, users)
2. Review this document
3. Look at the code comments
4. Open an issue for clarification

Remember: **Start simple, grow as needed**. Don't add complexity before you need it.
