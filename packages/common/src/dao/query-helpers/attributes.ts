import { Model, ModelCtor } from 'sequelize'

export const attributesExceptIdAndDates = <T extends Model> (model: ModelCtor<T>): string[] => {
  const { id, createdAt, updatedAt, ...attributeTuples } = model.getAttributes()
  return Object.keys(attributeTuples)
}
