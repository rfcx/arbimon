<template>
  <button
    id="dropdownTaxonFilterButton"
    data-dropdown-toggle="dropdownTaxonFilter"
    class="border-1 border-frequency rounded-full bg-moss text-frequency px-3 py-2 flex items-center gap-2"
  >
    <label>{{ selectedTaxonTitle }}</label>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="#ADFF2C"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
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
        @click="onSelectAll"
      >
        <div class="flex p-2 rounded items-center hover:bg-util-gray-03/60">
          <div class="flex">
            <input
              id="all"
              :aria-describedby="`class-checkbox-text-all`"
              type="radio"
              value="all"
              class="w-4 h-4 text-frequency border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency"
              :checked="selectedTaxonClasses.length === TAXON_CLASS_OPTIONS.length"
              @click="onSelectAll"
            >
          </div>
          <div class="ml-2">
            <label :for="`class-checkbox-text-all`">
              All taxons
            </label>
          </div>
        </div>
      </li>
      <li
        v-for="taxon in TAXON_CLASS_OPTIONS"
        :key="taxon.id"
        :class="{
          'opacity-50': !taxon.enabled
        }"
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
              :checked="selectedTaxonClasses.includes(taxon.id) && taxon.enabled"
              :disabled="!taxon.enabled"
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
import { computed, onMounted, ref, watch } from 'vue'

import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'

const emit = defineEmits<{(e: 'emitTaxonClassFilter', configChange: string[]): void }>()
const props = defineProps<{
  availableTaxonClasses: string[]
}>()

const TAXON_CLASS_OPTIONS = computed(() => {
  return Object.entries(TAXON_CLASSES_BY_ID)
        .map(([id, taxon]) => ({
          id,
          label: taxon.label
        }))
        .filter(c => c.id !== '200') // remove bats from options (see TAXON_CLASSES_BY_ID for reference)
        .map(c => ({ ...c, enabled: props.availableTaxonClasses.includes(c.id) }))
})

const selectedTaxonClasses = ref<string[]>(TAXON_CLASS_OPTIONS.value.map(({ id }) => id))

const selectedTaxonTitle = computed(() => {
  if (selectedTaxonClasses.value.length === 0) {
    return 'All taxons'
  }

  if (selectedTaxonClasses.value.length === TAXON_CLASS_OPTIONS.value.length) {
    return 'All taxons'
  }

  if (selectedTaxonClasses.value.length === 1) {
    const taxonClass = TAXON_CLASS_OPTIONS.value.find(({ id }) => id === selectedTaxonClasses.value[0])
    return taxonClass?.label
  }

  return `${selectedTaxonClasses.value.length} taxons`
})

const onSelectTaxonClass = (classId: string) => {
  if (!props.availableTaxonClasses.includes(classId)) return // if disable then do nothing
  if (selectedTaxonClasses.value.length === TAXON_CLASS_OPTIONS.value.length) {
    selectedTaxonClasses.value = [classId]
  } else if (selectedTaxonClasses.value.includes(classId)) {
    selectedTaxonClasses.value = selectedTaxonClasses.value.filter((id) => id !== classId)
  } else {
    selectedTaxonClasses.value = [...selectedTaxonClasses.value, classId]
  }
}

const onSelectAll = () => {
  selectedTaxonClasses.value = TAXON_CLASS_OPTIONS.value.map(({ id }) => id)
}

onMounted(() => {
  initDropdowns()
})

watch(() => selectedTaxonClasses.value, () => {
 emit('emitTaxonClassFilter', selectedTaxonClasses.value)
})

</script>
