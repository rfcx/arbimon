import { defineStore } from 'pinia'
import { type Ref, ref, watch } from 'vue'

import { useStoreOutsideSetup } from './index'

export const useDashboardStore = defineStore('metrics-store', () => {
  const store = useStoreOutsideSetup()

  const speciesThreatenedCount: Ref<number | undefined> = ref(undefined)
  const speciesCount: Ref<string | undefined> = ref(undefined)

  // Reset the values when the selectedProject has changed.
  watch(() => store.selectedProject, () => {
    speciesThreatenedCount.value = undefined
    speciesCount.value = undefined
  })

  const updateSpeciesThreatenedCount = (stc: number): void => {
    speciesThreatenedCount.value = stc
  }

  const updateSpeciesCount = (sc: string): void => {
    speciesCount.value = sc
  }

  return {
    speciesThreatenedCount,
    speciesCount,
    updateSpeciesThreatenedCount,
    updateSpeciesCount
  }
})
