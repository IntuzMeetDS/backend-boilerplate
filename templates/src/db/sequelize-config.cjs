require('dotenv').config();

/**
 * Sequelize CLI configuration
 * This file is used by sequelize-cli for migrations and seeders
 * 
 * Note: This is a CommonJS module (.cjs) because sequelize-cli doesn't support ES modules
 */

const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sslEnabled = process.env.DB_SSL === 'true';

  // Base configuration
  const baseConfig = {
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    dialectOptions: {
      ssl: sslEnabled ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  // Use DATABASE_URL if available (Neon, Heroku, etc.)
  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      use_env_variable: 'DATABASE_URL',
    };
  }

  // Use individual environment variables
  return {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'myapp',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  };
};

module.exports = {
  development: getDatabaseConfig(),
  test: getDatabaseConfig(),
  production: getDatabaseConfig(),
};
