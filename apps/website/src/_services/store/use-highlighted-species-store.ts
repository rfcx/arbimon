import { defineStore } from 'pinia'
import { ref } from 'vue'

import { type HighlightedSpeciesRow } from '@/insights/overview/types/highlighted-species'

interface HighlightedSpeciesItem {
  id: number
  species: HighlightedSpeciesRow
}

export const useHighlightedSpeciesStore = defineStore('highlighted-species-store', () => {
  const allSpecies = ref<HighlightedSpeciesItem[]>([])
  const updateSpecies = (species: HighlightedSpeciesRow[], offset: number): void => {
    let i = offset
    species.forEach(s => {
      allSpecies.value[i] = { id: i, species: s }
      i++
    })
  }

  return {
    allSpecies,
    updateSpecies
  }
})
