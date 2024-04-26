import { cleanup } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import { type Backup, BackupStatus } from '@rfcx-bio/common/dao/types/backup'

import component from './project-backup-history-list.vue'

const NOT_AVAILABLE_TEXT = 'Not yet available'
const EMPTY_TEXT = 'Looks like you haven\'t requested a backup recently.'

const createNewBackup = (status: BackupStatus, requestedAt: string, expiresAt?: string, link?: string): Backup => ({
  // dafault values
  id: 1,
  entity: 'project',
  entityId: 1,
  requestedBy: 1,
  // custom values
  requestedAt: new Date(requestedAt),
  status,
  url: link,
  expiresAt: expiresAt ? new Date(expiresAt) : undefined
})

const currentDate = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now

describe('Project backup: history list (state)', () => {
  afterEach(() => {
    cleanup()
  })

  test('show emtpy view when there is no backup history', async () => {
    // Arrange
    const data: Backup[] = []
    const wrapper = mount(component, { props: { data, isLoading: false, error: null } })

    // Assert
    expect(wrapper.text()).toContain(EMPTY_TEXT)
  })

  test.todo('show loading spinner when loading backup history')
  test.todo('show error message when loading backup history failed')
})

describe('Project backup: history list - item', () => {
  afterEach(() => {
    cleanup()
  })
  test('requested - show requested status, no expiry date, no link', async () => {
    // Arrange
    const data: Backup[] = [
      createNewBackup(BackupStatus.REQUESTED, '2021-01-01')
    ]
    const wrapper = mount(component, { props: { data, isLoading: false, error: null } })

    // Assert

    // status = requested
    expect(wrapper.text()).toContain('Requested')

    // request date = 2021-01-01
    expect(wrapper.text()).toContain('2021-01-01')

    // no link (not yet available)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Download')
    expect(wrapper.text()).toContain(NOT_AVAILABLE_TEXT)

    // no expiry date (n/a)
    expect(wrapper.text()).toContain('n/a')
  })
  test('in progress - show in progress status, no expiry date, no link', async () => {
    // Arrange
    const data: Backup[] = [
      createNewBackup(BackupStatus.PROCESSING, '2021-01-01')
    ]
    const wrapper = mount(component, { props: { data, isLoading: false, error: null } })

    // Assert

    // status = in progress
    expect(wrapper.text()).toContain('In progress')
    // request date = 2021-01-01
    expect(wrapper.text()).toContain('2021-01-01')

    // no link (not yet available)
    expect(wrapper.text()).not.toContain('Download')
    expect(wrapper.text()).toContain(NOT_AVAILABLE_TEXT)

    // no expiry date (n/a)
    expect(wrapper.text()).toContain('n/a')
  })

  test('completed - show completed status, expiry date, download link', async () => {
    // Arrange
    const link = 'https://example.com/backup1'
    const data: Backup[] = [
      createNewBackup(BackupStatus.AVAILABLE, '2021-01-01', currentDate, link)
    ]
    const wrapper = mount(component, { props: { data, isLoading: false, error: null } })

    // Assert

    // status = completed
    expect(wrapper.text()).toContain('Completed')

    // request date = 2021-01-01
    expect(wrapper.text()).toContain('2021-01-01')

    // link is available for download + clickable
    expect(wrapper.text()).toContain('Download')
    expect(wrapper.find('#expired-date-text').text()).not.toContain('T')
    expect(wrapper.element.querySelector('a')?.getAttribute('href')).toBe(link)

    // expiry date = currentDate
    expect(wrapper.text()).toContain(currentDate.split('T')[0])
  })
  test('expired - show expired status, no expiry date, no link', async () => {
    // Arrange
    const data: Backup[] = [
      createNewBackup(BackupStatus.AVAILABLE, '2021-01-01', '2021-01-01', 'https://example.com/backup1')
    ]
    const wrapper = mount(component, { props: { data, isLoading: false, error: null } })

    // Assert
    expect(wrapper.text()).toContain('Expired')
  })
})
