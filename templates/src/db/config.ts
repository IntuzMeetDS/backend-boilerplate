import { Sequelize, Options } from 'sequelize';

/**
 * Database configuration based on environment
 */
const getDatabaseConfig = (): Options => {
    const isProduction = process.env.NODE_ENV === 'production';
    const sslEnabled = process.env.DB_SSL === 'true';

    // Use DATABASE_URL if available (Neon, Heroku, etc.)
    if (process.env.DATABASE_URL) {
        return {
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
    }

    // Use individual environment variables
    return {
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'myapp',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
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
};

/**
 * Sequelize instance
 */
let sequelize: Sequelize | null = null;

/**
 * Get or create Sequelize instance
 */
export const getDatabase = (): Sequelize => {
    if (!sequelize) {
        const config = getDatabaseConfig();

        if (process.env.DATABASE_URL) {
            sequelize = new Sequelize(process.env.DATABASE_URL, config);
        } else {
            sequelize = new Sequelize(config);
        }
    }

    return sequelize;
};

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
    const db = getDatabase();

    try {
        await db.authenticate();
        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
    if (sequelize) {
        await sequelize.close();
        sequelize = null;
        console.log('✅ Database connection closed');
    }
};

export { Sequelize };
