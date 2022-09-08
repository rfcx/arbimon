import { Sequelize } from 'sequelize'
import type { Literal } from 'sequelize/types/lib/utils'

function literalIntegerArray2D (array: number[][], sequelize: Sequelize): Literal {
  return sequelize.literal(`'{${array.map(inner => '{' + inner.join(',') + '}').join(',')}}'`)
}

export function literalizeCountsByMinute<T extends { countsByMinute: number[][] }> (obj: T, sequelize: Sequelize): T & { countsByMinute: Literal } {
  return { ...obj, countsByMinute: literalIntegerArray2D(obj.countsByMinute, sequelize) }
}
