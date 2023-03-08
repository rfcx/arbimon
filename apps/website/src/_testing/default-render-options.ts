import { createTestingPinia } from '@pinia/testing'
import { type MountingOptions } from '@vue/test-utils'
import { vi } from 'vitest'

type VueTestUtilsRenderOptions = Omit<MountingOptions<Record<string, any>>, 'attachTo' | 'propsData' | 'shallow'>

export const DEFAULT_RENDER_OPTIONS: VueTestUtilsRenderOptions = {
  global: {
    plugins: [createTestingPinia({ createSpy: vi.fn })]
  }
}
