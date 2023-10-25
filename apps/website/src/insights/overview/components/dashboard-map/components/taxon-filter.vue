<template>
  <button
    id="dropdownTaxonFilterButton"
    data-dropdown-toggle="dropdownTaxonFilter"
    class="border-1 border-frequency rounded-full bg-moss text-frequency px-3 py-2"
  >
    {{ selectedTaxonTitle }}
  </button>

  <!-- Dropdown menu -->
  <div
    id="dropdownTaxonFilter"
    class="z-10 hidden bg-moss border-1 border-frequency rounded-lg"
  >
    <ul
      aria-labelledby="dropdownTaxonFilterButton"
      class="p-2 flex flex-col font-medium"
    >
      <li
        class="border-b border-fog/40"
        @click="selectAll"
      >
        <div class="flex p-2 rounded items-center hover:bg-util-gray-03/60">
          <div class="flex">
            <input
              :id="`class-checkbox-all`"
              :aria-describedby="`class-checkbox-text-all`"
              type="checkbox"
              value="all"
              class="w-4 h-4 text-frequency border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency"
              :checked="selectedTaxonClasses.length === TAXON_CLASS_OPTIONS.length"
            >
          </div>
          <div class="ml-2">
            <label :for="`class-checkbox-text-all`">
              All species
            </label>
          </div>
        </div>
      </li>
      <li
        v-for="taxon in TAXON_CLASS_OPTIONS"
        :key="taxon.id"
        @click="onSelectTaxonClass(taxon.id)"
      >
        <div class="flex p-2 rounded items-center hover:bg-util-gray-03/60">
          <div class="flex">
            <input
              :id="taxon.id"
              v-model="selectedTaxonClasses"
              :aria-describedby="`class-checkbox-text-${taxon.id}`"
              type="checkbox"
              :value="taxon.id"
              class="w-4 h-4 border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency text-frequency"
              :checked="selectedTaxonClasses.includes(taxon.id)"
            >
          </div>
          <div class="ml-2">
            <label :for="`class-checkbox-text-${taxon.id}`">
              {{ taxon.label }}
            </label>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'

const TAXON_CLASS_OPTIONS = Object.entries(TAXON_CLASSES_BY_ID).map(([id, taxon]) => ({
  id,
  label: taxon.label
}))

const selectedTaxonClasses = ref<string[]>(TAXON_CLASS_OPTIONS.map(({ id }) => id))

const selectedTaxonTitle = computed(() => {
  if (selectedTaxonClasses.value.length === 0) {
    return 'All species'
  }

  if (selectedTaxonClasses.value.length === TAXON_CLASS_OPTIONS.length) {
    return 'All species'
  }

  if (selectedTaxonClasses.value.length === 1) {
    const taxonClass = TAXON_CLASS_OPTIONS.find(({ id }) => id === selectedTaxonClasses.value[0])
    return taxonClass?.label
  }

  return `${selectedTaxonClasses.value.length} taxons`
})

const selectAll = () => {
  if (selectedTaxonClasses.value.length === TAXON_CLASS_OPTIONS.length) {
    selectedTaxonClasses.value = []
  } else {
    selectedTaxonClasses.value = TAXON_CLASS_OPTIONS.map(({ id }) => id)
  }
}

const onSelectTaxonClass = (classId: string) => {
  console.log('onSelectTaxonClass', classId)
  if (selectedTaxonClasses.value.length === TAXON_CLASS_OPTIONS.length) {
    selectedTaxonClasses.value = [classId]
  } else if (selectedTaxonClasses.value.includes(classId)) {
    selectedTaxonClasses.value = selectedTaxonClasses.value.filter((id) => id !== classId)
  } else {
    selectedTaxonClasses.value = [...selectedTaxonClasses.value, classId]
  }
}

onMounted(() => {
  initDropdowns()
})

</script>
