import { Sequelize, DataTypes, Optional } from 'sequelize';
import { BaseModel, BaseInitOptions } from './Base.model.js';

/**
 * User attributes interface
 */
export interface UserAttributes {
    id: string;
    email: string;
    name: string;
    age?: number;
    status?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

/**
 * User creation attributes (id is auto-generated)
 */
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'age' | 'status'> {}

/**
 * User model class extending BaseModel
 */
export class User extends BaseModel<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: string;
    public email!: string;
    public name!: string;
    public age?: number;
    declare status: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;

    /**
     * Define filterable attributes for User model
     * These attributes can be used in query filters
     */
    public static filterable_attributes: Array<string> = [
        ...BaseModel.default_filterable_attributes,
        'email',
        'name',
        'age',
    ];

    /**
     * Define sensitive attributes that should be excluded from responses
     */
    public static sensitive_attributes: Array<string> = [
        // Add sensitive fields here, e.g., 'password', 'token'
    ];
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
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: '0: inactive, 1: active',
            },
        },
        {
            sequelize,
            tableName: 'users',
            ...BaseInitOptions,
            indexes: [
                {
                    unique: true,
                    fields: ['email'],
                },
                {
                    fields: ['status'],
                },
            ],
        }
    );

    return User;
};
