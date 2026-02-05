# Base Model Documentation

## Overview

The `BaseModel` class provides a powerful foundation for all database models in the application. It includes common operations like filtering, sorting, pagination, and query parsing out of the box.

## Features

- **Soft Deletes**: Built-in paranoid mode with `deleted_at` timestamp
- **Advanced Filtering**: Support for multiple filter operators
- **Sorting**: Multi-field sorting with ascending/descending order
- **Pagination**: Built-in offset and limit support
- **Attribute Selection**: Choose which fields to return
- **Association Filtering**: Filter and sort on related models
- **Sensitive Data Handling**: Automatic exclusion of sensitive attributes

## Creating a New Model

### Basic Example

```typescript
import { Sequelize, DataTypes, Optional } from 'sequelize';
import { BaseModel, BaseInitOptions } from './Base.model.js';

// Define attributes interface
export interface ProductAttributes {
    id: string;
    name: string;
    price: number;
    description?: string;
    status: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

// Define creation attributes
export interface ProductCreationAttributes 
    extends Optional<ProductAttributes, 'id' | 'status' | 'description'> {}

// Extend BaseModel
export class Product extends BaseModel<ProductAttributes, ProductCreationAttributes> 
    implements ProductAttributes {
    
    public id!: string;
    public name!: string;
    public price!: number;
    public description?: string;
    public status!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at?: Date;

    // Define which attributes can be filtered
    public static filterable_attributes: Array<string> = [
        ...BaseModel.default_filterable_attributes,
        'name',
        'price',
        'description',
    ];

    // Define sensitive attributes to exclude from responses
    public static sensitive_attributes: Array<string> = [];
}

// Initialize the model
export const initProductModel = (sequelize: Sequelize): typeof Product => {
    Product.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        },
        {
            sequelize,
            tableName: 'products',
            ...BaseInitOptions, // Apply base options
        }
    );

    return Product;
};
```

## Query Operators

### Filter Operators

The `parseFilters` method supports the following operators:

| Operator | Description | Example | SQL Equivalent |
|----------|-------------|---------|----------------|
| `__in` | IN operator | `status__in=1\|2\|3` | `status IN (1, 2, 3)` |
| `__con` | Contains (case-insensitive) | `name__con=john` | `name ILIKE '%john%'` |
| `__sw` | Starts with | `email__sw=admin` | `email LIKE 'admin%'` |
| `__ew` | Ends with | `email__ew=@example.com` | `email LIKE '%@example.com'` |
| `__is` | Equals | `status__is=1` | `status = 1` |
| `__ne` | Not equal | `status__ne=0` | `status NOT IN (0)` |
| `__lte` | Less than or equal | `age__lte=30` | `age <= 30` |
| `__gte` | Greater than or equal | `age__gte=18` | `age >= 18` |
| `__nin` | Not in | `status__nin=0\|5` | `status NOT IN (0, 5)` |
| `__bet` | Between | `age__bet=18,65` | `age BETWEEN 18 AND 65` |

### Sorting

Use the `sort` parameter with pipe-separated fields:

```typescript
// Sort by name ascending
{ sort: 'name' }

// Sort by name descending (add - suffix)
{ sort: 'name-' }

// Multiple fields
{ sort: 'status|name-|created_at-' }
```

### Pagination

```typescript
{
    page: 0,  // Page number (0-indexed)
    size: 20  // Items per page
}
```

### Attribute Selection

```typescript
// Select specific fields
{ attributes: 'id|name|email' }

// Or as array
{ attributes: ['id', 'name', 'email'] }
```

## Usage Examples

### In Controllers

```typescript
import { Request, Response } from 'express';
import { models } from '../db/models/index.js';
import { IRetrieveQuery } from '../lib/types.js';

export const listUsers = async (req: Request, res: Response) => {
    try {
        const query: IRetrieveQuery = req.query;
        
        // Parse filters with pagination
        const filters = models.User.parseFilters(query, true);
        
        // Execute query
        const { rows, count } = await models.User.findAndCountAll(filters);
        
        // Sanitize sensitive data
        rows.forEach(user => user.sanitize());
        
        res.json({
            data: rows,
            meta: {
                total: count,
                page: query.page || 0,
                size: query.size || 10,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const query: IRetrieveQuery = req.query;
        
        // Parse filters without pagination
        const filters = models.User.parseFilters(query, false);
        
        const user = await models.User.findByPk(id, filters);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.sanitize();
        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

### Query Examples

#### Basic Filtering

```bash
# Get active users
GET /users?status__is=1

# Get users with specific IDs
GET /users?id__in=uuid1|uuid2|uuid3

# Search users by name
GET /users?name__con=john
```

#### Advanced Filtering

```bash
# Get users aged between 18 and 65
GET /users?age__bet=18,65

# Get users created on a specific date
GET /users?created_at__is=2024-01-15

# Get active users with email ending in @example.com
GET /users?status__is=1&email__ew=@example.com
```

#### Sorting and Pagination

```bash
# Get first page (20 items) sorted by name
GET /users?page=0&size=20&sort=name

# Get second page sorted by status desc, then name asc
GET /users?page=1&size=20&sort=status-|name

# Select specific attributes
GET /users?attributes=id|name|email&page=0&size=10
```

#### Combined Example

```bash
# Active users, aged 18-65, name contains "john", 
# sorted by created_at desc, page 2, 50 items per page
GET /users?status__is=1&age__bet=18,65&name__con=john&sort=created_at-&page=2&size=50
```

## Advanced Features

### Custom Date Fields

Override the `isDateField` method to add custom date fields:

```typescript
export class Product extends BaseModel<ProductAttributes, ProductCreationAttributes> {
    protected static isDateField(fieldName: string): boolean {
        const customDateFields = ['launch_date', 'expiry_date'];
        return super.isDateField(fieldName) || customDateFields.includes(fieldName);
    }
}
```

### Model Hooks

```typescript
export const initProductModel = (sequelize: Sequelize): typeof Product => {
    Product.init(/* ... */, /* ... */);
    
    // Add hooks
    Product.addHook('beforeCreate', (product) => {
        // Custom logic before creating
    });
    
    Product.addHook('afterUpdate', (product) => {
        // Custom logic after updating
    });
    
    return Product;
};
```

### Associations

```typescript
// In models/index.ts
export const initializeAssociations = (): void => {
    // One-to-Many
    models.User.hasMany(models.Product, { 
        foreignKey: 'user_id', 
        as: 'products' 
    });
    
    models.Product.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
    });
};
```

### Filtering with Includes

```typescript
const filters = models.Product.parseFiltersInclude({
    status__is: 1,
    include_user: {
        status__is: 1,
        name__con: 'john'
    }
}, true);

const products = await models.Product.findAll(filters);
```

## Best Practices

1. **Always define `filterable_attributes`**: Only allow filtering on indexed or necessary fields
2. **Use `sensitive_attributes`**: Protect sensitive data like passwords, tokens, etc.
3. **Enable pagination**: Always use `list: true` for list endpoints to prevent memory issues
4. **Validate input**: Sanitize and validate query parameters before passing to `parseFilters`
5. **Use indexes**: Add database indexes for frequently filtered/sorted fields
6. **Soft deletes**: Use the built-in paranoid mode instead of hard deletes
7. **Call `sanitize()`**: Always sanitize model instances before sending to clients

## TypeScript Types

The `IRetrieveQuery` interface is available in `lib/types.ts`:

```typescript
export interface IRetrieveQuery {
    page?: number;
    size?: number;
    sort?: string | number | Array<string | object> | object;
    attributes?: string | number | Array<string | object> | object;
    [key: string]: any; // For dynamic filter fields
}
```

## Migration from Standard Sequelize Models

If you have existing models, follow these steps:

1. Import `BaseModel` and `BaseInitOptions`
2. Change `extends Model` to `extends BaseModel`
3. Add `status`, `deleted_at` declarations
4. Define `filterable_attributes` array
5. Spread `...BaseInitOptions` in model initialization
6. Add `status` field to model definition

## Troubleshooting

### Filters not working

- Ensure the field is in `filterable_attributes`
- Check that the operator is spelled correctly (e.g., `__is`, not `__equals`)
- Verify the field exists in the model definition

### Sorting not working

- Ensure the field is in `filterable_attributes`
- Check the syntax: `field` for ASC, `field-` for DESC
- Use pipe separator for multiple fields: `field1|field2-`

### Pagination returning wrong results

- Remember: `page` is 0-indexed
- Offset calculation: `page * size`
- Always provide both `page` and `size` parameters
