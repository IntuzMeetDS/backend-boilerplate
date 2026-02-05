import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

/**
 * User attributes interface
 */
export interface UserAttributes {
    id: string;
    email: string;
    name: string;
    age?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * User creation attributes (id is auto-generated)
 */
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'age'> {}

/**
 * User model class
 */
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public name!: string;
    public age?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

/**
 * Initialize User model
 * 
 * @param sequelize - Sequelize instance
 * @returns Initialized User model
 */
export const initUserModel = (sequelize: Sequelize): typeof User => {
    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    len: [2, 100],
                },
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 0,
                    max: 150,
                },
            },
        },
        {
            sequelize,
            tableName: 'users',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email'],
                },
            ],
        }
    );

    return User;
};
