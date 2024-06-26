import { type DataType, type Model, type ModelAttributeColumnOptions } from 'sequelize'

export const modelAttributeToColumn = <M extends Model> (attribute: DataType | ModelAttributeColumnOptions<M>): ModelAttributeColumnOptions<M> =>
(typeof attribute !== 'string' && 'type' in attribute)
  ? attribute
  : { type: attribute }
