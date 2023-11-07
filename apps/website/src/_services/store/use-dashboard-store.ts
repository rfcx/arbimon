import { defineStore } from 'pinia'
import { type Ref, ref, watch } from 'vue'

import { useStoreOutsideSetup } from './index'

export const useDashboardStore = defineStore('metrics-store', () => {
  const store = useStoreOutsideSetup()

  const speciesThreatenedCount: Ref<number | undefined> = ref(undefined)
  const speciesCount: Ref<string | undefined> = ref(undefined)
  const projectSummary: Ref<string | undefined> = ref(undefined)
  const projectReadme: Ref<string | undefined> = ref(undefined)
  const projectObjectives: Ref<string[] | undefined> = ref(undefined)

  // Reset the values when the selectedProject has changed.
  watch(() => store.selectedProject, () => {
    speciesThreatenedCount.value = undefined
    speciesCount.value = undefined
    projectSummary.value = undefined
    projectReadme.value = undefined
    projectObjectives.value = undefined
  })

  const updateSpeciesThreatenedCount = (stc: number): void => {
    speciesThreatenedCount.value = stc
  }

  const updateSpeciesCount = (sc: string): void => {
    speciesCount.value = sc
  }

  const updateProjectSummary = (ps: string): void => {
    projectSummary.value = ps
  }

  const updateProjectObjectives = (ps: string[]): void => {
    projectObjectives.value = ps
  }

  const updateProjectReadme = (pr: string): void => {
    projectReadme.value = pr
  }

  return {
    speciesThreatenedCount,
    speciesCount,
    projectSummary,
    projectReadme,
    projectObjectives,
    updateSpeciesThreatenedCount,
    updateSpeciesCount,
    updateProjectReadme,
    updateProjectSummary,
    updateProjectObjectives
  }
})
