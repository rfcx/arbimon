export const defaultDisallowNull = <T> (attr: T): T & { allowNull: boolean } =>
  ({ allowNull: false, ...attr })
