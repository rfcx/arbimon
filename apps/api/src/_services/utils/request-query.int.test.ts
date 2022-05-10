import { arrayFromQuery } from './request-query'

describe.todo('UTIL: Array from query', () => {
  test('Should return arrays untouched', () => {
    const expected = ['a', 'b', 'c']
    const actual = arrayFromQuery(expected)
    expect(actual).toStrictEqual(expected)
  })

  test('Should return single-value arrays untouched', () => {
    const expected = ['a']
    const actual = arrayFromQuery(expected)
    expect(actual).toStrictEqual(expected)
  })

  test('Should return empty arrays untouched', () => {
    const expected = [] as string[]
    const actual = arrayFromQuery(expected)
    expect(actual).toStrictEqual(expected)
  })

  test('Should wrap strings as arrays', () => {
    const input = 'a'
    const expected = [input]
    const actual = arrayFromQuery(input)
    expect(actual).toStrictEqual(expected)
  })

  test('Should return an empty array by default', () => {
    const input = undefined
    const expected = [] as string[]
    const actual = arrayFromQuery(input)
    expect(actual).toStrictEqual(expected)
  })
})
