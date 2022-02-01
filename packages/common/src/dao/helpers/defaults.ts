import { Model, ModelAttributes, ModelCtor, ModelOptions, Sequelize } from 'sequelize'

import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { AutoPk, ModelForInterfacePk } from './types'
import { modelAttributeToColumn } from './utils'

// TODO: Update return type when they fix `sequelize.define`
type ModelFactory<T extends Model> = (sequelize: Sequelize) => ModelCtor<T>

export const defineWithDefaults = <
  DomainModel extends AutoPk,
  SequelizeModel extends Model = ModelForInterfacePk<DomainModel>, // TODO: Why doesn't this work with ModelForInterface<DomainModel>?!
  SequelizeAttributes = SequelizeModel['_attributes']
> (modelName: string, attributes: ModelAttributes<SequelizeModel, SequelizeAttributes>, options?: ModelOptions): ModelFactory<SequelizeModel> =>
  sequelize => sequelize.define<SequelizeModel>(modelName, attributesWithDefaults(attributes), options)

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
