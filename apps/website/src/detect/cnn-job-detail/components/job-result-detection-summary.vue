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
    <div
      v-if="details.length > displayItemNumber"
      class="flex justify-end items-center mt-2"
    >
      <button
        class="btn btn-icon ml-4"
        :disabled="displayIndex === 0"
        @click="previousPage()"
      >
        <icon-fas-chevron-left class="w-3 h-3" />
      </button>
      <button
        class="btn btn-icon ml-2"
        :disabled="displayIndex === Math.ceil(details.length / displayItemNumber) - 1"
        @click="nextPage()"
      >
        <icon-fas-chevron-right class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

import { displayValue } from '@rfcx-bio/utils/number'

const details = computed(() => {
  const species: { name: string, value: number }[] = []
  const speciesNames = ['Panthera pardus orientalis', 'Diceros bicornis', 'Pongo pygmaeus', 'Gorilla gorilla diehli', 'Gorilla beringei graueri', 'Eretmochelys imbricata', 'Rhinoceros sondaicus', 'Pongo abelii, Pongo pygmaeus', 'Pseudoryx nghetinhensis', 'Elephas maximus sumatranus']
  for (let index = 0; index < 27; index++) {
    species.push({
      name: speciesNames[Math.floor(Math.random() * speciesNames.length)],
      value: Math.random() * 10000
    })
  }

  return species.sort((a, b) => b.value - a.value)
})

const displayItemNumber = 10
const displayIndex = ref(0)

const displaySpecies = computed(() => details.value.slice(displayIndex.value * displayItemNumber, (displayIndex.value * displayItemNumber) + 11))

const displaySpeciesColumn1 = computed(() => displaySpecies.value.slice(0, displayItemNumber / 2))
const displaySpeciesColumn2 = computed(() => displaySpecies.value.slice((displayItemNumber / 2) + 1))

const previousPage = () => {
  displayIndex.value -= 1
}

const nextPage = () => {
  displayIndex.value += 1
}

</script>
