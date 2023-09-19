<template>
  <el-select
    v-model="selectedSpeciesSlug"
    filterable
    :filter-method="onFilterType"
    class="species-input bg-steel-grey rounded my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
    @change="onResetQuery"
  >
    <el-option
      v-for="species in filteredSpecies"
      :key="'species-selector-' + species.taxonSpeciesId"
      :value="species.taxonSpeciesSlug"
      class="min-h-12 h-12"
      :label="species.scientificName"
    >
      <div class="leading-tight mt-1">
        <div class="italic">
          {{ species.scientificName }}
        </div>
        <div class="text-xs text-white text-opacity-50">
          {{ species.commonName }}
        </div>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiBioGetProjectSpeciesAll } from '@rfcx-bio/common/api-bio/species/project-species-all'
import type { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { apiClientBioKey } from '@/globals'
import { useStore } from '~/store'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
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

  const response = await apiBioGetProjectSpeciesAll(apiClientBio, projectId)

  if (response == null) {
    return []
  }

  return response.species
}
</script>

<style scoped lang="scss">
:deep(.el-input__inner) {
  font-style: italic;
}

:deep(.select-trigger) {
  width: 300px;
}
</style>
