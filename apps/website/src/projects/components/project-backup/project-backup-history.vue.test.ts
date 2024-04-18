import { cleanup } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import component from './project-backup.vue'
import { type BackupHistory } from './types'

describe('Project backup - history list', () => {
  afterEach(() => {
    cleanup()
  })

  test('show emtpy view when there is no backup history', async () => {
    // Arrange
    const data: BackupHistory[] = []
    const wrapper = mount(component, { props: { data } })

    // Assert
    expect(wrapper.text()).toContain('Looks like you haven’t set up any backups yet.')
  })

  test.todo('show backup history list - min 1 item', async () => {})
  test.todo('show backup history list - max 3 items', async () => {})
  test.todo('download link grayed out if it is expired', async () => {})
})
