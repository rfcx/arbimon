import { Model, ModelAttributes, ModelCtor, ModelOptions, Optional, Sequelize } from 'sequelize'

import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { WithAutoPk } from '../type-helpers'
import { modelAttributeToColumn } from './utils'

// TODO: Update return type when they fix `sequelize.define`
export type ModelFactory<T extends Model> = (sequelize: Sequelize) => ModelCtor<T>

export type ModelForInterface<Props, PropsCreate = Props> =
  Model<Props, PropsCreate> & Props

// Model with optional PK during creation
export type ModelForInterfaceWithPk<Props extends WithAutoPk, PropsCreate = Optional<Props, 'id'>> =
  Model<Props, PropsCreate> & Props

export const defineWithDefaults = <
  DomainType,
  SequelizeModel extends Model = ModelForInterface<DomainType>,
  SequelizeAttributes = SequelizeModel['_attributes']
> (modelName: string, attributes: ModelAttributes<SequelizeModel, SequelizeAttributes>, options?: ModelOptions): ModelFactory<SequelizeModel> =>
  sequelize => sequelize.define<SequelizeModel>(modelName, attributesWithDefaults(attributes), optionsWithDefaults(modelName, options))

// TODO: Can probably add the PK to attributes automatically
export const defineWithDefaultsAutoPk = <
  DomainType extends WithAutoPk,
  SequelizeModel extends Model = ModelForInterfaceWithPk<DomainType>,
  SequelizeAttributes = SequelizeModel['_attributes']
> (modelName: string, attributes: ModelAttributes<SequelizeModel, SequelizeAttributes>, options?: ModelOptions): ModelFactory<SequelizeModel> =>
  defineWithDefaults<DomainType, SequelizeModel>(modelName, attributes, options)

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
            ...valueAsColumn
          }
        ]
      })
  ) as SequelizeModelAttributes

export const optionsWithDefaults = (modelName: string, options?: ModelOptions): ModelOptions =>
  ({
    ...options,
    name: {
      singular: modelName, // disable automatic singularization
      plural: modelName // disable automatic pluralization
    }
  })
