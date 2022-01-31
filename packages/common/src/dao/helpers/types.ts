import { Model, ModelCtor, Optional, Sequelize } from 'sequelize'

export interface AutoPk { id: number }

export type ModelForInterfaceNoPk<Props, PropsCreate = Props> =
  Model<Props, PropsCreate> & Props

export type ModelForInterfacePk<Props extends AutoPk, PropsCreate = Optional<Props, 'id'>> =
  Model<Props, PropsCreate> & Props

export type ModelForInterface<Props> = Props extends AutoPk
  ? ModelForInterfacePk<Props>
  : ModelForInterfaceNoPk<Props>

export type ModelFactory<T> = (sequelize: Sequelize) => ModelCtor<ModelForInterface<T>>
