<template>
  <div class="relative w-80 my-6">
    <form>
      <div
        class="flex relative items-center"
      >
        <input
          v-model="currentSpeciesQuery"
          class="block bg-moss border-util-gray-03 text-sm rounded-md w-full placeholder:text-insight focus:(border-frequency ring-frequency)"
          type="text"
          data-dropdown-toggle="searchResultDropdown"
          @focus="hasFocusInput = true"
          @blur="hasFocusInput = false"
        >
        <span
          class="italic absolute left-3 pointer-events-none text-sm"
          :class="{
            'hidden': currentSpeciesQuery !== '',
            'text-util-gray-03': hasFocusInput
          }"
        >{{ allSpecies.find(s => s.taxonSpeciesSlug === selectedSpeciesSlug)?.scientificName }}</span>
        <span class="absolute right-4 cursor-pointer pointer-events-none">
          <span class="sr-only">Type to search</span>
          <icon-fa-chevron-down
            class="w-3 h-3 fa-chevron-down text-util-gray-03"
            :class="hasFocusInput ? 'transform rotate-180' : ''"
          />
        </span>
      </div>
    </form>
    <div
      id="searchResultDropdown"
      class="absolute hidden w-full z-10 bg-white rounded-md shadow dark:bg-gray-700 mt-2"
    >
      <ul class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md">
        <li
          v-if="filteredSpecies.length === 0"
          class="rounded-lg p-4 text-center text-sm"
        >
          No data
        </li>
        <li
          v-for="species in filteredSpecies"
          v-else
          :key="'species-selector-' + species.taxonSpeciesId"
          class="cursor-pointer rounded-lg px-4 py-2 hover:bg-util-gray-03 text-sm"
          @click="onSelectSpecies(species)"
        >
          <div class="italic">
            {{ species.scientificName }}
          </div>
          <div class="text-xs text-insight text-opacity-50">
            {{ species.commonName }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiBioGetProjectSpeciesLight } from '@rfcx-bio/common/api-bio/species/project-species-all'
import type { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'

const apiClientBio = inject(apiClientKey) as AxiosInstance
const store = useStore()
const route = useRoute()
const router = useRouter()

const props = withDefaults(defineProps<{ speciesSlug: string }>(), {
  speciesSlug: ''
})

const emit = defineEmits<{(event: 'emitSelectedSpeciesChange', species: SpeciesInProjectTypes['light'] | undefined): void}>()

const selectedSpeciesSlug = ref('')
const allSpecies = ref<Array<SpeciesInProjectTypes['light']>>([])
const currentSpeciesQuery = ref('')

const hasFocusInput = ref(false)

const selectedSpecies = computed<SpeciesInProjectTypes['light'] | undefined>(() => {
  if (!selectedSpeciesSlug.value) {
    return undefined
  }

  return allSpecies.value.find(s => s.taxonSpeciesSlug === selectedSpeciesSlug.value)
})

const filteredSpecies = computed<Array<SpeciesInProjectTypes['light']>>(() => {
  if (!currentSpeciesQuery.value) {
    return allSpecies.value
  }

  const query = currentSpeciesQuery.value.trim().toLowerCase()

  return allSpecies.value.filter(s => {
    return s.scientificName.toLowerCase().split(' ').some(w => w.startsWith(query)) || (s.commonName?.toLowerCase().split(' ').some(w => w.startsWith(query)) ?? false)
  })
})

const onSelectSpecies = (species: SpeciesInProjectTypes['light']) => {
  selectedSpeciesSlug.value = species.taxonSpeciesSlug
  onResetQuery()
  // TODO: hide dropdown
}

onMounted(async () => {
  allSpecies.value = await getAllSpecies()
})

watch(() => route, async (to, from) => {
  if (to.params.projectSlug !== from.params.projectSlug) {
    selectedSpeciesSlug.value = ''
    allSpecies.value = await getAllSpecies()

    // reset not-exists species slug in the url.
    if (from.name === to.name && !allSpecies.value.length) {
      void router.replace({ params: { speciesSlug: '' }, query: route.query })
    }
  }
})

watch(() => props.speciesSlug, (newValue) => {
  if (props.speciesSlug && newValue !== selectedSpeciesSlug.value) {
    selectedSpeciesSlug.value = newValue
  }
})

watch(allSpecies, (newValue) => {
  if (newValue.length > 0) {
    if (props.speciesSlug) {
      const matchedSlug = allSpecies.value.find(({ taxonSpeciesSlug }) => taxonSpeciesSlug === props.speciesSlug)
      selectedSpeciesSlug.value = matchedSlug ? props.speciesSlug : ''
      if (!matchedSlug) {
        // not-exists spesies; select a first species from the species list.
        selectedSpeciesSlug.value = allSpecies.value[0].taxonSpeciesSlug
      }
    } else {
      selectedSpeciesSlug.value = allSpecies.value[0].taxonSpeciesSlug
    }
  }

  if (selectedSpecies.value) {
    emit('emitSelectedSpeciesChange', selectedSpecies.value)
  }
})

watch(selectedSpeciesSlug, () => {
  if (selectedSpecies.value) {
    emit('emitSelectedSpeciesChange', selectedSpecies.value)
  }
})

const onFilterType = (query: string): void => {
  currentSpeciesQuery.value = query
}

const onResetQuery = (): void => {
  onFilterType('')
}

const getAllSpecies = async (): Promise<Array<SpeciesInProjectTypes['light']>> => {
  const projectId = store.selectedProject?.id

  if (projectId === undefined) {
    return []
  }

  const response = await apiBioGetProjectSpeciesLight(apiClientBio, projectId)

  if (response == null) {
    return []
  }

  return response.species
}
</script>
