import numeral from 'numeral'

export const firstDiffDigit = (newVal: number, oldVal: number): number => {
  const newString = newVal.toString()
  const oldString = oldVal.toString()

  for (let i = 0; i < newString.length; i++) {
    const newChar = newString.charAt(i)
    const oldChar = i < oldString.length ? oldString.charAt(i) : ''
    if (newChar !== oldChar) return Number(newChar)
  }
  return NaN
}

export const displayValue = (value: number): string => {
  if (value > 99_999) return numeral(value).format('0a')

  return numeral(value).format('0,0')
}

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) { const temp = a; a = b; b = temp }
  while (true) {
      if (b === 0) return a
      a %= b
      if (a === 0) return b
      b %= a
  }
}

export const toPrecisionNumber = (value: number, precision?: number | undefined): number => {
  return parseFloat(value.toPrecision(precision))
}
