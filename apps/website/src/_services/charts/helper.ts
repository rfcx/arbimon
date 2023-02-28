export function roundedPercentage<T> (selector: (x: T) => number, xs: T[]): Array<[T, number]> {
  // calculate the difference between the 100% and the sum of the rounded percentages
  const difference = 100 - xs.reduce((acc, curr) => acc + Math.abs(Math.floor(selector(curr))), 0)

  // distribute the difference between the rounded values in decreasing order of their decimal parts
  const { result } = [...xs].reduce(
    (acc, curr) => {
      if (acc.difference > 0) {
        acc.difference -= 1
        acc.result.push([curr, Math.floor(selector(curr)) + 1])
      } else {
        acc.result.push([curr, Math.floor(selector(curr))])
      }
      return acc
    },
    { difference, result: [] as Array<[T, number]> }
  )

  return result
}
