import { Model, ModelCtor } from 'sequelize'

export const getDataFromBioDb = async <T extends Model> (model: ModelCtor<T>): Promise<T[]> => {
  // Get a list of all attributes EXCEPT id, createdAt, updatedAt
  const { id, createdAt, updatedAt, ...attributeTuples } = model.getAttributes()
  const attributes = Object.keys(attributeTuples)

  // Query & return
  return await model.findAll({ raw: true, attributes })
}
