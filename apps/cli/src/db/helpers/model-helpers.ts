import { snakeCase } from 'lodash-es'
import { DataType, Model, ModelAttributeColumnOptions, ModelAttributes, ModelCtor, ModelOptions, Sequelize } from 'sequelize'

import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { AutoPk, ModelForInterfacePk } from './model-types'

export const defaultDisallowNull = <T> (attr: T): T & { allowNull: boolean } =>
  ({ allowNull: false, ...attr })

export const modelAttributeToColumn = <M extends Model> (attribute: DataType | ModelAttributeColumnOptions<M>): ModelAttributeColumnOptions<M> =>
  (typeof attribute !== 'string' && 'type' in attribute)
    ? attribute
    : { type: attribute }

export const attributesWithDefaults = <
  SequelizeModel extends Model,
  SequelizeAttributes = SequelizeModel['_attributes'],
  SequelizeModelAttributes extends ModelAttributes<SequelizeModel, SequelizeAttributes> = ModelAttributes<SequelizeModel, SequelizeAttributes>
> (attributes: SequelizeModelAttributes): SequelizeModelAttributes =>
  Object.fromEntries(
    Object.entries(attributes)
      .map((entry) => {
        const key = entry[0] as keyof SequelizeModelAttributes
        const value = entry[1] as ValueOf<SequelizeModelAttributes>
        const valueAsColumn = modelAttributeToColumn(value)

        return [
          key,
          {
            allowNull: false, // disallow nulls by default
            field: snakeCase(key.toString()), // use snake_case for columns
            ...valueAsColumn
          }
        ]
      })
  ) as SequelizeModelAttributes

export const optionsWithDefaults = (options?: ModelOptions): ModelOptions =>
  ({
    underscored: true, // use snake_case for auto columns
    ...options
  })

export const defineWithDefaults = <
  DomainModel extends AutoPk,
  SequelizeModel extends Model = ModelForInterfacePk<DomainModel>, // TODO: Why doesn't this work with ModelForInterface<DomainModel>?!
  SequelizeAttributes = SequelizeModel['_attributes']
> (sequelize: Sequelize, modelName: string, attributes: ModelAttributes<SequelizeModel, SequelizeAttributes>, options?: ModelOptions): ModelCtor<SequelizeModel> => // TODO: Update return type when they fix `sequelize.define`
  sequelize.define<SequelizeModel>(
    modelName,
    attributesWithDefaults(attributes),
    optionsWithDefaults(options)
  )
