import { cleanup } from '@testing-library/vue'
import { afterEach, describe, test } from 'vitest'

describe('Project export - role', () => {
  afterEach(() => {
    cleanup()
  })

  // admin role
  test.todo('can see export button')
  test.todo('can request new export')
  test.todo('can click on the link to download the file')
  test.todo('export button is hidden if last requested within 7 days')

  // other roles
  test.todo('cannot see export button without admin role')
})
