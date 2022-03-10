import { expect, test } from 'vitest'

test('Seq running test 1', async () => {
  // Act
  await new Promise(resolve => {
    console.info('Seq starting 1')
    setTimeout(() => {
      console.info('Seq ending 1')
      resolve(true)
    }, 1000)
  })

  // Assert
  expect(true).toBe(true)
})

test('Seq running test 2', async () => {
  // Act
  await new Promise(resolve => {
    console.info('Seq starting 2')
    setTimeout(() => {
      console.info('Seq ending 2')
      resolve(true)
    }, 1000)
  })

  // Assert
  expect(true).toBe(true)
})
