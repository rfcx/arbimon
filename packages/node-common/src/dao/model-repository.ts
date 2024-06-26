import { mapValues } from 'lodash-es'
import { type Model, type ModelCtor, type Sequelize } from 'sequelize'

import { type ModelRegistrations, modelRegistrations } from './model-registrations'

export type AllModels = { [K in keyof ModelRegistrations]: ReturnType<ModelRegistrations[K][0]> }
type UnknownModel = ModelCtor<Model<any, any>> | undefined

export class ModelRepository {
  static instance: ModelRepository | undefined
  static getInstance (sequelize: Sequelize, registrations: Partial<ModelRegistrations> = modelRegistrations): AllModels {
    if (!ModelRepository.instance) { ModelRepository.instance = new ModelRepository(sequelize, registrations) }
    return ModelRepository.instance.repo
  }

  readonly repo: AllModels

  constructor (sequelize: Sequelize, registrations: Partial<ModelRegistrations> = modelRegistrations) {
    const repo = mapValues(registrations, registration => registration?.[0](sequelize)) as AllModels

    Object.entries(registrations)
      .forEach(([modelName, registration]) => {
        const associations = registration[1]
        if (!associations) return

        const source = repo[modelName as keyof AllModels] as UnknownModel
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

        if ('manyToMany' in associations) {
          associations.manyToMany?.forEach(targetName => {
            const target = repo[targetName.model] as UnknownModel
            const junctionModel = repo[targetName.through] as UnknownModel

            if (!target) return
            if (!junctionModel) return

            if (targetName?.foreignKey != null) {
              source.belongsToMany(target, { through: junctionModel, foreignKey: targetName.foreignKey })
            } else {
              source.belongsToMany(target, { through: junctionModel })
            }
          })
        }
      })

    this.repo = repo
  }
}
