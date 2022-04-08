import { mapValues } from 'lodash-es'
import { Model, ModelCtor, Sequelize } from 'sequelize'

import { ModelRegistrations, modelRegistrations } from './model-registrations'

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
          associations.oneToOne?.forEach(targetNameOrObject => {
            const { target, foreignKey } = extractTargetFk(repo, targetNameOrObject)
            if (!target || !foreignKey) return

            source.belongsTo(target, { foreignKey })
            target.hasOne(source, { foreignKey })
          })
        }

        if ('manyToOne' in associations) {
          associations.manyToOne?.forEach(targetNameOrObject => {
            const { target, foreignKey } = extractTargetFk(repo, targetNameOrObject)
            if (!target || !foreignKey) return

            source.belongsTo(target, { foreignKey })
            target.hasMany(source, { foreignKey })
          })
        }
      })

    this.repo = repo
  }
}

const extractTargetFk = (repo: AllModels, nameOrObject: string | { model: string, foreignKey: string }): { target: UnknownModel | undefined, foreignKey: string | undefined } => { 
  if (typeof nameOrObject === 'object') {
    // Custom FK
    const { model, foreignKey } = nameOrObject
    const target = repo[model as keyof AllModels] as UnknownModel
    if (!target) return { target, foreignKey: undefined }

    return { target, foreignKey }
  } else {
    // Default FK
    const target = repo[nameOrObject as keyof AllModels] as UnknownModel
    if (!target) return { target, foreignKey: undefined }

    const foreignKey = `${target.name[0].toLowerCase()}${target.name.slice(1)}Id`
    return { target, foreignKey }
  }
}
