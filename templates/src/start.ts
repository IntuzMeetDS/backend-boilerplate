import 'dotenv/config';
import { createServer } from './server.js';
import { initializeDatabase } from './db/config.js';
import { parseIntSafe } from './lib/utils.js';

const PORT = parseIntSafe(process.env.PORT, 3000);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<void> {
    try {
        // Initialize database connection (optional - comment out if not using DB)
        // await initializeDatabase();

        // Create and start server
        const server = await createServer();

        await server.listen({ port: PORT, host: HOST });
        
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
        console.log(`📚 API v1 available at http://${HOST}:${PORT}/api/v1`);
        console.log(`❤️  Health check: http://${HOST}:${PORT}/api/v1/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown handler
 */
const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
        // Close database connection if initialized
        // await closeDatabase();
        
        console.log('✅ Server closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the application
bootstrap();
