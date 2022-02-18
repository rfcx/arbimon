import { mapValues } from 'lodash-es'
import { Model, ModelCtor, Sequelize } from 'sequelize'

import { ModelRegistrations, modelRegistrations } from './model-registrations'

export type ModelRepository = { [K in keyof ModelRegistrations]: ReturnType<ModelRegistrations[K][0]> }
type UnknownModel = ModelCtor<Model<any, any>> | undefined

export class ModelRepositoryFactory {
  static instance: ModelRepositoryFactory | undefined
  static getInstance (sequelize: Sequelize, registrations: Partial<ModelRegistrations> = modelRegistrations): ModelRepository {
    if (!ModelRepositoryFactory.instance) { ModelRepositoryFactory.instance = new ModelRepositoryFactory(sequelize, registrations) }
    return ModelRepositoryFactory.instance.repo
  }

  readonly repo: ModelRepository

  constructor (sequelize: Sequelize, registrations: Partial<ModelRegistrations> = modelRegistrations) {
    const repo = mapValues(registrations, registration => registration?.[0](sequelize)) as ModelRepository

    Object.entries(registrations)
      .forEach(([modelName, registration]) => {
      const associations = registration[1]
      const source = repo[modelName as keyof ModelRepository] as UnknownModel
      if (!source) throw new Error('Models must be constructed & registered before associations can be added')

      if ('oneToOne' in associations) {
        associations.oneToOne?.forEach(targetName => {
          const target = repo[targetName] as UnknownModel
          if (!target) return

          const foreignKey = `${target.name[0].toLowerCase()}${target.name.slice(1)}Id`
          source.belongsTo(target, { foreignKey })
          target.hasOne(source, { foreignKey })
        })
      }

      if ('manyToOne' in associations) {
        associations.manyToOne?.forEach(targetName => {
          const target = repo[targetName] as UnknownModel
          if (!target) return

          const foreignKey = `${target.name[0].toLowerCase()}${target.name.slice(1)}Id`
          source.belongsTo(target, { foreignKey })
          target.hasMany(source, { foreignKey })
        })
      }
    })

    this.repo = repo
  }
}
