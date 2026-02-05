import {
  CreationOptional,
  FindOptions,
  Includeable,
  IncludeOptions,
  Model,
  ModelOptions,
  Op,
} from 'sequelize';
import {IRetrieveQuery} from '../../../../types';
import moment from 'moment';

export const BaseInitOptions: ModelOptions = {
  freezeTableName: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  defaultScope: {
    // where: {
    //   deleted_at: null
    // },
    attributes: { exclude: ['deleted_at'] },
  },
};

export class BaseModel<
  TModelAttributes extends {} = any,
  TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  public static _base_list_attributes: string[] = ['id', 'created_at', 'updated_at', 'status'];
  public static sensitive_attributes: Array<string> = [];
  declare id: CreationOptional<string>;
  declare status: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date>;

  public static default_filterable_attributes: Array<string> = [
    'id',
    'status',
    'created_at',
    'updated_at',
  ];

  public static filterable_attributes: Array<string> = [];

  public static initialize(db) {}

  public static initAssociations(db) {}

  public static initializeScope(db) {}

  public static initializeHooks(db) {}

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
          // (page - 1) * pageSize
          if (key === 'page') filters.offset = +query.page * +query.size;
          else if (key === 'size') {
            filters.limit = +query.size;
          } else if (query[key]) {
            if (key.includes('__in')) {
              const base_key = key.replace('__in', '');
              if (this.filterable_attributes.includes(base_key)) {
                filters.where[base_key] = {
                  // @ts-ignore
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
                if (
                  [
                    'created_at',
                    'updated_at',
                    'contact_date',
                    'period_start',
                    'period_end',
                    'generated_on',
                    'accept_date',
                    'first_contact_date',
                    'end_date',
                    'retracted_date',
                    'from_date',
                    'form_date',
                    'effective_date',
                    'referral_service_accept_date',
                    'service_ended_date',
                    'supervisor_signature_date',
                    'referral_date',
                    'init_plan_date',
                    'init_plan_supervisor_date',
                    'review_plan_date',
                    'review_plan_fa_date',
                    'review_plan_supervisor_date',
                    'incident_date',
                    'ci_date',
                    'time',
                    'ci_time',
                    'cps_sent_referral_date',
                    'referral_received_date',
                    'accepted_date',
                    'incarcerated_from_date',
                    'incarcerated_end_date',
                    'parole_from_date',
                    'parole_end_date',
                    'start_date_of_previous_services_mental_history',
                    'end_date_of_previous_services_mental_history',
                    'start_date_of_current_services_mental_history',
                    'end_date_of_current_services_mental_history',
                    'previous_date_od_substances_used',
                    'current_date_od_substances_used',
                    'start_date_previous_chemical_dependency',
                    'end_date_previous_chemical_dependency',
                    'start_date_current_chemical_dependency',
                    'end_date_current_chemical_dependency',
                    'cps_involvement_start_date',
                    'cps_involvement_end_date',
                    'undisclosed_cps_involvement_start_date',
                    'undisclosed_cps_involvement_end_date',
                    'referral_accepted_date'
                  ].includes(base_key)
                ) {
                  const startOfDay = moment.utc(query[key] as moment.MomentInput).startOf('day');
                  // console.log('startOfDay: ', startOfDay);
                  const endOfDay = moment.utc(query[key] as moment.MomentInput).endOf('day');
                  // console.log('endOfDay: ', endOfDay);
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
                  // @ts-ignore
                  [Op.notIn]: query[key].split('|'),
                };
              }
            } else if (key.includes('__lte')) {
              const base_key = key.replace('__lte', '');
              if (this.filterable_attributes.includes(base_key)) {
                if (['service_date', 'coupon_applicable_from'].includes(base_key)) {
                  filters.where[base_key] = {
                    [Op.lte]: query[key],
                  };
                } else {
                  filters.where[base_key] = query[key];
                }
              }
            } else if (key.includes('__gte')) {
              const base_key = key.replace('__gte', '');
              if (this.filterable_attributes.includes(base_key)) {
                if (['service_date', 'coupon_applicable_to'].includes(base_key)) {
                  filters.where[base_key] = {
                    [Op.gte]: query[key],
                  };
                } else {
                  filters.where[base_key] = query[key];
                }
              }
            } else if (key.includes('__nin')) {
              const base_key = key.replace('__nin', '');
              if (this.filterable_attributes.includes(base_key)) {
                filters.where[base_key] = {
                  // @ts-ignore
                  [Op.notIn]: query[key].split('|'),
                };
              }
            } else if (key.includes('__bet')) {
              const base_key = key.replace('__bet', '');
              if (this.filterable_attributes.includes(base_key)) {
                filters.where[base_key] = {
                  // @ts-ignore
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

      // const isStatusCol = 'deleted_at' in this.getAttributes();
      // if (isStatusCol) {
      //   filters.where['deleted_at'] = null;
      // }
    } catch (err) {
      console.log('Error (Parse Filters): ', err);
    }
    return filters;
  }

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
              console.log('associationName: ', associationName);
              const includeFilters = typeof query[key] === 'object' ? query[key] : {};
              console.log('includeFilters: ', includeFilters);
              const includeQuery: IRetrieveQuery = includeFilters as IRetrieveQuery;
              console.log('includeQuery: ', includeQuery);
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
              if (key.includes('__in')) {
                const base_key = key.replace('__in', '');
                if (this.filterable_attributes.includes(base_key)) {
                  filters.where[base_key] = {
                    // @ts-ignore
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
                    // @ts-ignore
                    [Op.notIn]: query[key].split('|'),
                  };
                }
              }
            }
          }
        }
      });

      // const isStatusCol = 'deleted_at' in this.getAttributes();
      // if (isStatusCol) {
      //   filters.where['deleted_at'] = null;
      // }
    } catch (err) {
      console.log('Error (Parse Filters): ', err);
    }
    console.log('filters: ', filters);
    return filters;
  }

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

  private static parseAttributes(
    query: string | number | Array<string | object> | object
  ): Array<string> {
    const parsed: Array<string> = [];
    let attributes: Array<string> = [];

    if (typeof query === 'string') {
      attributes = query.split('|');
    } else if (Array.isArray(query)) {
      attributes = query as Array<string>;
    } else {
      return [];
    }

    return attributes;
  }

  public sanitize() {}

  public static generateIncludeWhereClause(queryData, filterableIncludeAttributes) {
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

  public static generateSortOrder(queryData, filterableSortAttributes, includeModel) {
    const sortParams = queryData.sort ? queryData.sort.split('|') : [];
    const validSortParams = sortParams.filter(param => filterableSortAttributes.includes(param));

    if (validSortParams.length > 0) {
      const order = validSortParams.map(param => {
        if (param === 'location_id') {
          return [{ model: includeModel, as: 'BranchLocations' }, 'location_id'];
        }
        return param;
      });
      return order;
    } else {
      return null;
    }
  }
}
