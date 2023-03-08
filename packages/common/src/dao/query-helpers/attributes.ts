import { type Model, type ModelStatic } from 'sequelize'

export const attributesExceptIdAndDates = <T extends Model> (model: ModelStatic<T>): string[] => {
  const { id, createdAt, updatedAt, ...attributeTuples } = model.getAttributes()
  return Object.keys(attributeTuples)
}
