import { defineStore } from 'pinia'
import { ref } from 'vue'

import { type HighlightedSpeciesRow } from '@/insights/overview/types/highlighted-species'

interface HighlightedSpeciesItem {
  index: number
  species: HighlightedSpeciesRow
}

export const useHighlightedSpeciesStore = defineStore('highlighted-species-store', () => {
  const allSpecies = ref<HighlightedSpeciesItem[]>([])
  const selectedProjectId = ref(-1)
  const totalSpecies = ref(0)

  const updateSpecies = (species: HighlightedSpeciesRow[], offset: number, total: number): void => {
    totalSpecies.value = total
    let i = offset
    species.forEach(s => {
      allSpecies.value[i] = { index: i, species: s }
      i++
    })
  }

  const getSpeciesByPage = (page: number, limit: number): HighlightedSpeciesRow[] => {
    return allSpecies.value.filter(s => (s.index >= (page - 1) * limit) && s.index < (page * limit)).map(i => i.species)
  }

  const updateselectedProjectId = (id: number): void => {
    if (selectedProjectId.value !== id) {
      allSpecies.value = []
      selectedProjectId.value = id
    }
  }

  return {
    totalSpecies,
    updateSpecies,
    getSpeciesByPage,
    updateselectedProjectId
  }
})
