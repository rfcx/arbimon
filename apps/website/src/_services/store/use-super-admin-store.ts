import { defineStore } from 'pinia'
import { ref } from 'vue'

import { type LocationProjectTypes } from '@rfcx-bio/node-common/dao/types'

export const useSuperStore = defineStore('project-super-store', () => {
  const project = ref<LocationProjectTypes['light'] | null>(null)
  const setSelectedProject = (p: LocationProjectTypes['light'] | null): void => {
    project.value = p
  }
  return {
    project,
    setSelectedProject
  }
})
