# Quick Start Guide

Get your backend running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- PostgreSQL installed (optional, for database features)

## Step 1: Install Dependencies

```bash
cd boilerplate
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings (optional for basic testing)
nano .env
```

**Minimal configuration for testing** (no database required):

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
```

## Step 3: Start Development Server

```bash
npm run dev
```

You should see:

```
🚀 Server running at http://0.0.0.0:3000
📚 API v1 available at http://0.0.0.0:3000/api/v1
❤️  Health check: http://0.0.0.0:3000/api/v1/health
🌍 Environment: development
```

## Step 4: Test the API

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is healthy",
  "data": {
    "status": "healthy",
    "uptime": 5.123,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "development",
    "services": {
      "database": "not_configured",
      "cache": "not_configured"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create User (Example)

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe",
    "age": 30
  }'
```

### List Users

```bash
curl http://localhost:3000/api/v1/users
```

### Get User by ID

```bash
curl http://localhost:3000/api/v1/users/550e8400-e29b-41d4-a716-446655440000
```

## Step 5: Enable Database (Optional)

If you want to use the database features:

### 1. Start PostgreSQL

```bash
# Using Docker
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Update .env

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp
```

### 3. Uncomment Database Initialization

In `src/start.ts`, uncomment:

```typescript
// Initialize database connection
await initializeDatabase();
```

### 4. Run Database Migrations

Create the database schema by running migrations:

```bash
npm run db:migrate
```

This will create the `users` table and necessary indexes. You should see output like:

```
Sequelize CLI [Node: 20.x.x]

Loaded configuration file "src/db/sequelize-config.cjs".
Using environment "development".
== 20250205000000-create-users-table: migrating =======
== 20250205000000-create-users-table: migrated (0.045s)
```

### 5. Seed Sample Data (Optional)

Populate the database with sample users:

```bash
npm run db:seed
```

This will insert 5 sample users into the database. You can now test the API with existing data:

```bash
# List all seeded users
curl http://localhost:3000/api/v1/users

# Get a specific seeded user
curl http://localhost:3000/api/v1/users/550e8400-e29b-41d4-a716-446655440001
```

#### Migration Commands Reference

- `npm run db:migrate` - Run all pending migrations
- `npm run db:migrate:undo` - Rollback the last migration
- `npm run db:seed` - Run all seeders

### 6. Restart Server

```bash
npm run dev
```

## Next Steps

### Add Your First Feature

1. **Create a schema** in `src/schemas/posts.schemas.ts`
2. **Create a route** in `src/routes/posts.routes.ts`
3. **Register route** in `src/routes/index.ts`
4. **Test it!**

### Add Database Model

1. **Create model** in `src/db/models/Post.model.ts`
2. **Register model** in `src/db/models/index.ts`
3. **Use in controller**

### Add Middleware

1. **Create middleware** in `src/middlewares/auth.middleware.ts`
2. **Register** in `src/middlewares/index.ts`

## Common Issues

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

### TypeScript Errors

```bash
# Rebuild
npm run build
```

### Database Connection Failed

- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall settings

## Development Tips

### Hot Reload

The dev server automatically reloads on file changes.

### View Logs

Logs are formatted with `pino-pretty` in development:

```
[16:24:00.123] INFO (12345): Incoming request
    method: "GET"
    url: "/api/v1/health"
    ip: "127.0.0.1"
```

### Debug Mode

Set `LOG_LEVEL=debug` in .env for more verbose logging.

### Test Validation

Try sending invalid data to see validation in action:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "name": "A"}'
```

## Production Build

```bash
# Build
npm run build

# Set production environment
export NODE_ENV=production
export DATABASE_URL=your-production-db

# Run
npm start
```

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Check [STRUCTURE.md](STRUCTURE.md) for architecture guide
- Review example implementations in `src/routes/` and `src/controllers/`

## What's Included

✅ Global error handling  
✅ Request validation (JSON Schema)  
✅ Standardized responses  
✅ API versioning (/api/v1)  
✅ TypeScript with strict mode  
✅ Database ready (Sequelize)  
✅ Request logging  
✅ Health check endpoints  
✅ Environment configuration  
✅ Example CRUD operations  

Happy coding! 🚀
