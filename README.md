# create-backend-boilerplate

CLI tool to scaffold a minimal, production-ready Fastify + TypeScript + Sequelize backend boilerplate.

## Usage

```bash
npx create-backend-boilerplate
```

Or with npm:

```bash
npm create backend-boilerplate
```

The CLI will interactively prompt you for:
- Project name
- Project description
- Author name
- Optional features (Redis)

## What You Get

- **Fastify** - High-performance web framework
- **TypeScript** - Type safety and modern JavaScript
- **Sequelize** - PostgreSQL ORM with migrations
- **Global Error Handling** - Centralized error management
- **Validation Schemas** - Fastify JSON schema validation
- **Standardized Responses** - Consistent API response format
- **API Versioning** - `/api/v1` prefix with upgrade path
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for pre-commit checks

## Optional Features

During setup, you can choose to include:

- **Redis** - Caching and session storage

## Requirements

- Node.js >= 20.0.0
- PostgreSQL (if using database features)

## Local Development

```bash
# Clone and link locally
git clone <repo>
cd create-backend-boilerplate
npm install
npm link

# Use it
npx create-backend-boilerplate
```

## License

MIT
