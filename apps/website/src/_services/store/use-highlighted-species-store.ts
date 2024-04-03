import { defineStore } from 'pinia'
import { ref } from 'vue'

import { type HighlightedSpeciesRow } from '@/insights/overview/types/highlighted-species'

interface HighlightedSpeciesItem {
  id: number
  species: HighlightedSpeciesRow
}

export const useHighlightedSpeciesStore = defineStore('highlighted-species-store', () => {
  const allSpecies = ref<HighlightedSpeciesItem[]>([])
  const selectedProjectId = ref(-1)

  const updateSpecies = (species: HighlightedSpeciesRow[], offset: number): void => {
    let i = offset
    species.forEach(s => {
      allSpecies.value[i] = { id: i, species: s }
      i++
    })
  }

  const getSpeciesByPage = (page: number, limit: number): HighlightedSpeciesRow[] => {
    return allSpecies.value.filter(s => (s.id >= (page - 1) * limit) && s.id < (page * limit)).map(i => i.species)
  }

  const updateselectedProjectId = (id: number): void => {
    if (selectedProjectId.value !== id) {
      allSpecies.value = []
      selectedProjectId.value = id
    }
  }

  return {
    allSpecies,
    updateSpecies,
    getSpeciesByPage,
    updateselectedProjectId
  }
})
