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
