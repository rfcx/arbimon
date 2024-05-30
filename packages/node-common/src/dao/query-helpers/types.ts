import { type Model, type WhereOptions } from 'sequelize'

export type Where<T> = WhereOptions<Model<T>['_attributes']>
