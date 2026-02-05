import { getDatabase } from '../config.js';
import { initUserModel, User } from './User.model.js';

/**
 * Model registry
 * 
 * Import and initialize all models here
 */

const db = getDatabase();

// Initialize models
const UserModel = initUserModel(db);

/**
 * Export all models
 */
export const models = {
    User: UserModel,
};

/**
 * Export Sequelize instance for direct access if needed
 */
export { db };

/**
 * Initialize all model associations
 * 
 * Define relationships between models here
 * Call this after all models are registered
 */
export const initializeAssociations = (): void => {
    // Define associations here
    // Example:
    // models.User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
    // models.Post.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
};

/**
 * Sync all models with database
 * 
 * WARNING: Only use in development! Use migrations in production.
 */
export const syncModels = async (force: boolean = false): Promise<void> => {
    try {
        await db.sync({ force });
        console.log('✅ All models synchronized with database');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error);
        throw error;
    }
};
