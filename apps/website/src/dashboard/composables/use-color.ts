import { type ComputedRef, computed, inject } from 'vue'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'

export interface UseColor {
  color: ComputedRef<string>
}

export const useColor = (): UseColor => {
  const store = inject(storeKey) as BiodiversityStore

  const color = computed(() => {
    return store.datasetColors[0] ?? '#EFEFEF'
  })

  return {
    color
  }
}
