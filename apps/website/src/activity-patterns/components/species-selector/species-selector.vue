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
import UFuzzy from '@leeoniya/ufuzzy'
import type { AxiosInstance } from 'axios'
import type { Ref } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { apiClientBioKey } from '@/globals'
import { useStore } from '~/store'
import { useGetAllSpeciesInProject } from './composables/use-get-all-species-in-project'

const uf: Ref<UFuzzy> = ref(new UFuzzy())
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()
const route = useRoute()
const router = useRouter()

const props = withDefaults(defineProps<{ speciesSlug: string }>(), {
  speciesSlug: ''
})

const emit = defineEmits<{(event: 'emitSelectedSpeciesChange', species: SpeciesInProjectTypes['light'] | undefined): void}>()

const selectedSpeciesSlug = ref('')
const currentSpeciesQuery = ref('')

const { data: allSpecies, refetch } = useGetAllSpeciesInProject(apiClientBio, store.selectedProject?.id ?? -1)

const selectedSpecies = computed<SpeciesInProjectTypes['light'] | undefined>(() => {
  if (!selectedSpeciesSlug.value) {
    return undefined
  }

  return allSpecies.value?.species?.find(s => s.taxonSpeciesSlug === selectedSpeciesSlug.value)
})

const filteredSpecies = computed<Array<SpeciesInProjectTypes['light']>>(() => {
  if (allSpecies.value == null) {
    return []
  }

  if (!currentSpeciesQuery.value) {
    return allSpecies.value.species
  }

  const haystack = allSpecies.value.species.map(sp => {
    return `${sp.scientificName}¦${sp.commonName}`
  })

  const indexes = uf.value.filter(haystack, currentSpeciesQuery.value)

  if (indexes == null) {
    return allSpecies.value.species ?? []
  }

  return indexes.map(i => allSpecies.value.species[i])
})

watch(() => route, async (to, from) => {
  if (to.params.projectSlug !== from.params.projectSlug) {
    selectedSpeciesSlug.value = ''
    refetch.value()

    // reset not-exists species slug in the url.
    if (from.name === to.name && (allSpecies.value?.species == null || !allSpecies.value.species.length)) {
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
  if (newValue != null && newValue.species.length > 0) {
    if (props.speciesSlug) {
      const matchedSlug = newValue.species.find(({ taxonSpeciesSlug }) => taxonSpeciesSlug === props.speciesSlug)
      selectedSpeciesSlug.value = matchedSlug ? props.speciesSlug : ''
      if (!matchedSlug) {
        // not-exists spesies; select a first species from the species list.
        selectedSpeciesSlug.value = newValue.species[0].taxonSpeciesSlug
      }
    } else {
      selectedSpeciesSlug.value = newValue.species[0].taxonSpeciesSlug
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
</script>

<style scoped lang="scss">
:deep(.el-input__inner) {
  font-style: italic;
}

:deep(.select-trigger) {
  width: 300px;
}
</style>
