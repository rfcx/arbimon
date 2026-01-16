<template>
  <div class="relative w-80 my-6">
    <form
      id="siteSearchInput"
      ref="siteSearchInput"
    >
      <div
        class="flex relative items-center"
        data-dropdown-toggle="searchResultDropdown"
      >
        <input
          v-model="currentSpeciesQuery"
          class="block bg-moss border-util-gray-03 text-sm rounded-md w-full placeholder:text-insight focus:(border-frequency ring-frequency)"
          type="text"
          @focus="hasFocusInput = true"
          @blur="hasFocusInput = false"
          @click="onClickSpeciesInput"
        >
        <span
          class="italic absolute left-4 pointer-events-none text-sm"
          :class="{'hidden': currentSpeciesQuery !== '','text-util-gray-03': hasFocusInput}"
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
      class="absolute hidden w-full z-40 bg-white rounded-md shadow dark:bg-gray-700 mt-2"
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
import { Dropdown, initDropdowns } from 'flowbite'
import type { Ref } from 'vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiBioGetProjectSpecies } from '@rfcx-bio/common/api-bio/species/project-species-all'
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

const siteSearchInput = ref<HTMLDivElement | null>(null)
const dropdown = ref() as Ref<Dropdown>

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

  const queries = currentSpeciesQuery.value.trim().toLowerCase().split(' ')
  return allSpecies.value.filter(s => {
    const matchedScientificName = queries.every(q => s.scientificName.toLowerCase().includes(q))
    const matchedCommonName = queries.every(q => (s.commonName?.toLowerCase() ?? '').includes(q))
    return matchedScientificName || matchedCommonName
  })
})

const onSelectSpecies = (species: SpeciesInProjectTypes['light']) => {
  selectedSpeciesSlug.value = species.taxonSpeciesSlug
  onResetQuery()
  dropdown.value.hide()
}

onMounted(async () => {
  initDropdowns()
  allSpecies.value = await getAllSpecies()
  dropdown.value = new Dropdown(
    document.getElementById('searchResultDropdown'),
    document.getElementById('siteSearchInput'),
    { placement: 'bottom-start', triggerType: 'none', offsetDistance: 1 }
  )
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

  // temp hide it to check twice calling endpoint
  // if (selectedSpecies.value) {
  //   emit('emitSelectedSpeciesChange', selectedSpecies.value)
  // }
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

const onClickSpeciesInput = (): void => {
  dropdown.value.show()
}

const getAllSpecies = async (): Promise<Array<SpeciesInProjectTypes['light']>> => {
  const projectId = store.project?.id

  if (projectId === undefined) {
    return []
  }

  const response = await apiBioGetProjectSpecies(apiClientBio, projectId, { limit: 1000, offset: 0 })

  if (response == null) {
    return []
  }

  return response.species as Array<SpeciesInProjectTypes['light']>
}
</script>
