import {
    CreationOptional,
    FindOptions,
    Includeable,
    IncludeOptions,
    Model,
    ModelOptions,
    Op,
} from 'sequelize';
import { IRetrieveQuery } from '../../lib/types.js';
import moment from 'moment';

/**
 * Base model initialization options
 * Common configuration for all models
 */
export const BaseInitOptions: ModelOptions = {
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    defaultScope: {
        attributes: { exclude: ['deleted_at'] },
    },
};

/**
 * Base model class with common operations
 * All application models should extend this class
 */
export class BaseModel<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
    /**
     * Base attributes to include in list operations
     */
    public static _base_list_attributes: string[] = ['id', 'created_at', 'updated_at', 'status'];

    /**
     * Sensitive attributes that should be excluded from responses
     */
    public static sensitive_attributes: Array<string> = [];

    /**
     * Common model attributes
     */
    declare id: CreationOptional<string>;
    declare status: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare deleted_at: CreationOptional<Date>;

    /**
     * Default filterable attributes available for all models
     */
    public static default_filterable_attributes: Array<string> = [
        'id',
        'status',
        'created_at',
        'updated_at',
    ];

    /**
     * Model-specific filterable attributes
     * Override this in child models to add custom filterable fields
     */
    public static filterable_attributes: Array<string> = [];

    /**
     * Initialize model (override in child models)
     */
    public static initialize(db: any): void {}

    /**
     * Initialize model associations (override in child models)
     */
    public static initAssociations(db: any): void {}

    /**
     * Initialize model scopes (override in child models)
     */
    public static initializeScope(db: any): void {}

    /**
     * Initialize model hooks (override in child models)
     */
    public static initializeHooks(db: any): void {}

    /**
     * Parse query filters into Sequelize FindOptions
     * 
     * Supported operators:
     * - __in: IN operator (e.g., status__in=1|2|3)
     * - __con: LIKE operator (e.g., name__con=john)
     * - __sw: Starts with (e.g., email__sw=admin)
     * - __ew: Ends with (e.g., email__ew=@example.com)
     * - __is: Equals (e.g., status__is=1)
     * - __ne: Not equal (e.g., status__ne=0)
     * - __lte: Less than or equal (e.g., age__lte=30)
     * - __gte: Greater than or equal (e.g., age__gte=18)
     * - __nin: Not in (e.g., status__nin=0|5)
     * - __bet: Between (e.g., age__bet=18,65)
     * 
     * @param query - Query parameters
     * @param list - Whether this is a list operation (enables pagination)
     * @returns Sequelize FindOptions
     */
    public static parseFilters(query: IRetrieveQuery, list: boolean = false): FindOptions {
        const filters: FindOptions & { where: {} } = { where: {} } as FindOptions & { where: {} };
        try {
            Object.keys(query).forEach((key: string) => {
                if (key === 'sort') {
                    filters.order = this.parseSorting(query.sort);
                }

                if (key === 'attributes') {
                    filters.attributes = this.parseAttributes(query.attributes);
                }

                if (list) {
                    // Pagination: (page - 1) * pageSize
                    if (key === 'page') filters.offset = +query.page * +query.size;
                    else if (key === 'size') {
                        filters.limit = +query.size;
                    } else if (query[key]) {
                        if (key.includes('__in')) {
                            const base_key = key.replace('__in', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.in]: query[key].split('|'),
                                };
                            }
                        } else if (key.includes('__con')) {
                            const base_key = key.replace('__con', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.iLike]: `%${query[key]}%`,
                                };
                            }
                        } else if (key.includes('__sw')) {
                            const base_key = key.replace('__sw', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.startsWith]: query[key],
                                };
                            }
                        } else if (key.includes('__ew')) {
                            const base_key = key.replace('__ew', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.endsWith]: query[key],
                                };
                            }
                        } else if (key.includes('__is')) {
                            const base_key = key.replace('__is', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                // Handle date fields
                                if (this.isDateField(base_key)) {
                                    const startOfDay = moment.utc(query[key] as moment.MomentInput).startOf('day');
                                    const endOfDay = moment.utc(query[key] as moment.MomentInput).endOf('day');
                                    filters.where[base_key] = {
                                        [Op.between]: [startOfDay, endOfDay],
                                    };
                                } else {
                                    filters.where[base_key] = query[key];
                                }
                            }
                        } else if (key.includes('__ne')) {
                            const base_key = key.replace('__ne', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.notIn]: query[key].split('|'),
                                };
                            }
                        } else if (key.includes('__lte')) {
                            const base_key = key.replace('__lte', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.lte]: query[key],
                                };
                            }
                        } else if (key.includes('__gte')) {
                            const base_key = key.replace('__gte', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.gte]: query[key],
                                };
                            }
                        } else if (key.includes('__nin')) {
                            const base_key = key.replace('__nin', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.notIn]: query[key].split('|'),
                                };
                            }
                        } else if (key.includes('__bet')) {
                            const base_key = key.replace('__bet', '');
                            if (this.filterable_attributes.includes(base_key)) {
                                filters.where[base_key] = {
                                    [Op.between]: query[key].split(','),
                                };
                            }
                        }
                    } else if (query[key] == null) {
                        const base_key = key.replace('__is', '');
                        if (this.filterable_attributes.includes(base_key)) {
                            filters.where[base_key] = null;
                        }
                    }
                }
            });
        } catch (err) {
            console.log('Error (Parse Filters): ', err);
        }
        return filters;
    }

    /**
     * Parse filters with include support for associated models
     * 
     * @param query - Query parameters
     * @param list - Whether this is a list operation
     * @returns Sequelize FindOptions with include
     */
    public static parseFiltersInclude(query: IRetrieveQuery, list: boolean = false): FindOptions {
        const filters: FindOptions & { where: {} } = { where: {} } as FindOptions & { where: {} };
        try {
            Object.keys(query).forEach((key: string) => {
                if (key === 'sort') {
                    filters.order = this.parseSorting(query.sort);
                }

                if (key === 'attributes') {
                    filters.attributes = this.parseAttributes(query.attributes);
                }

                if (list) {
                    if (key === 'page') {
                        filters.offset = +query.page * +query.size;
                    } else if (key === 'size') {
                        filters.limit = +query.size;
                    } else if (query[key]) {
                        // Handle filters for included models
                        if (key.startsWith('include_')) {
                            const associationName = key.substring('include_'.length);
                            const includeFilters = typeof query[key] === 'object' ? query[key] : {};
                            const includeQuery: IRetrieveQuery = includeFilters as IRetrieveQuery;
                            const includeFiltersResult = this.parseFiltersInclude(includeQuery, false);

                            let includeArray: Includeable[];

                            if (Array.isArray(filters.include)) {
                                includeArray = filters.include;
                            } else {
                                includeArray = [];
                            }
                            includeArray.push({
                                association: associationName,
                                ...(includeFiltersResult as IncludeOptions),
                            });

                            filters.include = includeArray;
                        } else {
                            // Apply standard filters
                            if (key.includes('__in')) {
                                const base_key = key.replace('__in', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    filters.where[base_key] = {
                                        [Op.in]: query[key].split('|'),
                                    };
                                }
                            } else if (key.includes('__con')) {
                                const base_key = key.replace('__con', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    filters.where[base_key] = {
                                        [Op.iLike]: `%${query[key]}%`,
                                    };
                                }
                            } else if (key.includes('__sw')) {
                                const base_key = key.replace('__sw', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    filters.where[base_key] = {
                                        [Op.startsWith]: query[key],
                                    };
                                }
                            } else if (key.includes('__ew')) {
                                const base_key = key.replace('__ew', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    filters.where[base_key] = {
                                        [Op.endsWith]: query[key],
                                    };
                                }
                            } else if (key.includes('__is')) {
                                const base_key = key.replace('__is', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    if (['created_at', 'updated_at'].includes(base_key)) {
                                        const startOfDay = moment(query[key] as moment.MomentInput).startOf('day');
                                        const endOfDay = moment(query[key] as moment.MomentInput).endOf('day');
                                        filters.where[base_key] = {
                                            [Op.between]: [startOfDay, endOfDay],
                                        };
                                    } else {
                                        filters.where[base_key] = query[key];
                                    }
                                }
                            } else if (key.includes('__ne')) {
                                const base_key = key.replace('__ne', '');
                                if (this.filterable_attributes.includes(base_key)) {
                                    filters.where[base_key] = {
                                        [Op.notIn]: query[key].split('|'),
                                    };
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.log('Error (Parse Filters Include): ', err);
        }
        return filters;
    }

    /**
     * Parse sorting parameters
     * 
     * Format: field1|field2-|field3
     * - field: ascending order
     * - field-: descending order
     * 
     * @param query - Sort query
     * @returns Array of [field, direction] tuples
     */
    private static parseSorting(
        query: string | number | Array<string | object> | object
    ): Array<[string, string]> {
        const parsed: Array<[string, string]> = [];
        let parameters: Array<string> = [];

        if (typeof query === 'string') {
            parameters = query.split('|');
        } else if (Array.isArray(query)) {
            parameters = query as Array<string>;
        } else {
            return [['id', 'DESC']];
        }

        parameters.map((item) => {
            let itemData: any = false;
            if (item === 'status' || item === 'status-') {
                itemData = ['status', item.at(-1) === '-' ? 'ASC' : 'DESC'];
            } else {
                itemData = item.at(-1) === '-' ? [item.slice(0, -1), 'DESC'] : [item, 'ASC'];
            }
            if (
                this.filterable_attributes.includes(itemData[0]) &&
                ['ASC', 'DESC'].includes(itemData[1])
            ) {
                parsed.push(itemData);
            }
        });

        return parsed.length ? parsed : [['id', 'DESC']];
    }

    /**
     * Parse attribute selection
     * 
     * @param query - Attributes query
     * @returns Array of attribute names
     */
    private static parseAttributes(
        query: string | number | Array<string | object> | object
    ): Array<string> {
        let attributes: Array<string> = [];

        if (typeof query === 'string') {
            attributes = query.split('|');
        } else if (Array.isArray(query)) {
            attributes = query as Array<string>;
        }

        return attributes;
    }

    /**
     * Check if a field is a date field
     * Override this in child models to add custom date fields
     * 
     * @param fieldName - Field name to check
     * @returns True if field is a date field
     */
    protected static isDateField(fieldName: string): boolean {
        const commonDateFields = [
            'created_at',
            'updated_at',
            'deleted_at',
            'date',
            'timestamp',
        ];
        return commonDateFields.includes(fieldName);
    }

    /**
     * Generate where clause for included models
     * 
     * @param queryData - Query data
     * @param filterableIncludeAttributes - Filterable attributes for the included model
     * @returns Where clause object
     */
    public static generateIncludeWhereClause(queryData: any, filterableIncludeAttributes: string[]): any {
        let whereClause = {};
        const includedAttributes = Object.keys(queryData).map(key => {
            const [fieldName, operator] = key.split('__');
            return { fieldName, operator };
        }).filter(({ fieldName }) =>
            filterableIncludeAttributes.includes(fieldName)
        );

        if (includedAttributes.length > 0) {
            whereClause = {
                [Op.and]: includedAttributes.map(({ fieldName, operator }) => {
                    const value = queryData[`${fieldName}__${operator}`];
                    switch (operator) {
                        case 'is':
                            return { [fieldName]: { [Op.eq]: value } };
                        case 'in':
                            return { [fieldName]: { [Op.in]: value.split('|') } };
                        case 'con':
                            return { [fieldName]: { [Op.iLike]: `%${value}%` } };
                        default:
                            return null;
                    }
                }).filter(condition => condition !== null)
            };
        }
        return whereClause;
    }

    /**
     * Generate sort order for included models
     * 
     * @param queryData - Query data
     * @param filterableSortAttributes - Sortable attributes
     * @param includeModel - Model to include
     * @returns Order array
     */
    public static generateSortOrder(queryData: any, filterableSortAttributes: string[], includeModel: any): any {
        const sortParams = queryData.sort ? queryData.sort.split('|') : [];
        const validSortParams = sortParams.filter((param: string) => filterableSortAttributes.includes(param));

        if (validSortParams.length > 0) {
            const order = validSortParams.map((param: string) => {
                // Override this logic in child models for custom sorting
                return param;
            });
            return order;
        }
        return null;
    }

    /**
     * Sanitize model instance (remove sensitive data)
     * Override this in child models to implement custom sanitization
     */
    public sanitize(): void {
        const constructor = this.constructor as typeof BaseModel;
        constructor.sensitive_attributes.forEach(attr => {
            if (attr in this) {
                delete (this as any)[attr];
            }
        });
    }
}
