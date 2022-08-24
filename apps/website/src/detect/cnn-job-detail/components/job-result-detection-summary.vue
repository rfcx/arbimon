<template>
  <div class="job-result-detection-summary-wrapper">
    <span class="job-result-detection-summary-header text-subtle text-sm">Detection summary</span>
    <div class="job-result-detection-summary-detail grid grid-cols-8">
      <template
        v-for="(column, idx) in [displaySpeciesColumn1, displaySpeciesColumn2]"
        :key="'detection-summary-species-column-' + idx"
      >
        <div class="col-span-4">
          <div class="job-result-validation-status-detail grid grid-cols-6 gap-2">
            <template
              v-for="item in column"
              :key="'validation-status-' + item.label"
            >
              <div class="col-span-1 justify-self-center">
                {{ displayValue(item.value) }}
              </div>
              <div class="col-span-5">
                {{ item.name }}
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import { displayValue } from '@rfcx-bio/utils/number'

const details = computed(() => {
  const species: { name: string, value: number }[] = []
  const speciesNames = ['Panthera pardus orientalis', 'Diceros bicornis', 'Pongo pygmaeus', 'Gorilla gorilla diehli', 'Gorilla beringei graueri', 'Eretmochelys imbricata', 'Rhinoceros sondaicus', 'Pongo abelii, Pongo pygmaeus', 'Pseudoryx nghetinhensis', 'Elephas maximus sumatranus']
  for (let index = 0; index < 15; index++) {
    species.push({
      name: speciesNames[Math.floor(Math.random() * speciesNames.length)],
      value: Math.random() * 10000
    })
  }

  return species.sort((a, b) => b.value - a.value)
})

const displayIndex = ref(0)

const displaySpecies = computed(() => details.value.slice(displayIndex.value * 10, (displayIndex.value * 10) + 11))

const displaySpeciesColumn1 = computed(() => displaySpecies.value.slice(0, 5))
const displaySpeciesColumn2 = computed(() => displaySpecies.value.slice(6))

</script>
