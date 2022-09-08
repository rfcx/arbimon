import { Sequelize } from 'sequelize'
import type { Literal } from 'sequelize/types/lib/utils'

export function literalIntegerArray2D (array: number[][], sequelize: Sequelize): Literal {
  return sequelize.literal(`'{${array.map(inner => '{' + inner.join(',') + '}').join(',')}}'`)
}

export function literalizeCountsByMinute<T extends { countsByMinute: number[][] }> (obj: T, sequelize: Sequelize): T & { countsByMinute: Literal } {
  return { ...obj, countsByMinute: literalIntegerArray2D(obj.countsByMinute, sequelize) }
}

export function reducedAndSortedPairs (array: number[][]): number[][] {
  const newArray = []
  for (const item of array) {
    if (item.length !== 2) continue
    const index = newArray.findIndex(v => v[0] === item[0])
    if (index === -1) {
      newArray.push(item)
    } else {
      newArray[index][1] = newArray[index][1] + item[1]
    }
  }
  return newArray.sort((a, b) => a[0] - b[0])
}