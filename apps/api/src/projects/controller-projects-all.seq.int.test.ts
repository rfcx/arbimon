import { expect, test } from 'vitest'

test('Seq running test 1', async () => {
  // Act
  await new Promise((res) => {
    console.log('Seq starting 1')
    setTimeout(() => {
      console.log('Seq ending 1')
      res(true)
    }, 1000)
  })

  // Assert
  expect(true).toBe(true)
})

test('Seq running test 2', async () => {
  // Act
  await new Promise((res) => {
    console.log('Seq starting 2')
    setTimeout(() => {
      console.log('Seq ending 2')
      res(true)
    }, 1000)
  })

  // Assert
  expect(true).toBe(true)
})
