<template>
  <div
    id="species-highlighted-modal"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-3/5 max-h-full">
      <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
        <div class="flex flex-col gap-y-4">
          <!-- Modal header -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-y-3">
              <h2>Highlighted species</h2>
              <h6>
                Select up to five species to highlight in this project.
              </h6>
            </div>
            <button
              type="button"
              data-modal-toggle="species-highlighted-modal"
              @click="resetSearch();resetPagination();$emit('emitClose')"
            >
              <icon-custom-fi-close-thin class="cursor-pointer" />
            </button>
          </div>
          <el-input
            v-model="searchKeyword"
            placeholder="Search species"
            size="large"
            class="w-1/3 bg-mock"
          >
            <template #prefix>
              <div class="inline-flex items-center">
                <icon-fas-search class="text-base text-insight" />
              </div>
            </template>
          </el-input>
          <div class="flex flex-row items-center gap-x-2">
            <el-tag
              v-for="(riskRating, index) in existingRiskCode"
              :key="riskRating.code"
              v-modal="searchRisk"
              class="species-highlights border-none cursor-pointer text-md h-6"
              :class="searchRisk === existingRiskCode[index].code ? 'tag-selected' : ''"
              effect="dark"
              size="large"
              :color="riskRating.color"
              :title="riskRating.code"
              round
              @click="filterByCode(existingRiskCode[index].code)"
            >
              {{ riskRating.code }}
            </el-tag>
          </div>
          <!-- Modal body -->
          <div class="grid grid-cols-3 gap-x-4 w-full">
            <div class="grid grid-cols-1 gap-y-4 col-span-2">
              <ul
                v-if="speciesList && speciesList.length"
                class="grid gap-2 grid-cols-1 lg:(grid-cols-2 gap-3)"
              >
                <li
                  v-for="item in speciesForCurrentPage"
                  :key="'specie-highlighted-' + item.slug"
                  :class="isSpecieSelected(item) ? 'border-frequency' : 'border-transparent'"
                  class="flex flex-row justify-center border-1 items-center rounded-lg space-x-3 p-4 flex-wrap h-full md:(h-26 flex-wrap justify-center) lg:(h-26 flex-nowrap justify-between) bg-echo hover:(border-frequency cursor-pointer)"
                  @click="selectSpecie(item)"
                >
                  <img
                    :src="item.photoUrl"
                    class="h-16 w-16 object-cover rounded bg-util-gray-02"
                  >
                  <div class="self-center w-36 md:overflow-hidden">
                    <p
                      class="text-s italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
                      :title="item.scientificName"
                    >
                      {{ item.scientificName }}
                    </p>
                    <p
                      class="mt-1 text-xs tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
                      :title="item.commonName || 'unknown'"
                    >
                      {{ item.commonName || 'unknown' }}
                    </p>
                  </div>
                  <div class="self-center">
                    <el-tag
                      class="species-highlights border-none text-md h-6"
                      effect="dark"
                      size="large"
                      :color="item.riskRating.color"
                      :title="item.riskRating.label"
                    >
                      {{ item.riskRating.code }}
                    </el-tag>
                  </div>
                </li>
              </ul>
              <icon-fas-spinner
                v-if="isLoadingSpecies"
                class="animate-spin w-8 h-8 lg:mx-24 mx-12"
              />
              <h6 v-if="!speciesList.length">
                No species in a project.
              </h6>
              <el-pagination
                v-if="speciesList.length"
                v-model:currentPage="currentPage"
                class="flex items-center justify-center"
                :page-size="PAGE_SIZE"
                :total="speciesLength"
                layout="prev, pager, next"
              />
            </div>
            <div class="grid grid-cols-1">
              <HighlightedSpeciesSelector
                :species="preSelectedSpecies"
                @emit-remove-specie="removeSpecieFromList"
              />
            </div>
          </div>
          <!-- Modal footer -->
          <div class="flex flex-row justify-end baseline">
            <button
              data-modal-hide="species-highlighted-modal"
              type="button"
              class="btn btn-primary group"
              @click="saveHighlightedSpecies"
            >
              Continue
              <icon-custom-arrow-right
                v-if="!isLoadingPostSpecies"
                class="ml-2 h-4 w-4 inline text-pitch group-hover:stroke-pitch"
              />
              <icon-fas-spinner
                v-if="isLoadingPostSpecies || isLoadingDeleteSpecies"
                class="ml-2 h-4 w-4 inline text-pitch group-hover:stroke-pitch"
                :disabled="isLoadingPostSpecies || isLoadingDeleteSpecies"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import { useDeleteSpecieHighlighted, usePostSpeciesHighlighted } from '../composables/use-post-highlighted-species'
import { useSpeciesInProject } from '../composables/use-species-in-project'
import HighlightedSpeciesSelector, { type SpecieRow } from './highlighted-species-selector.vue'

const props = defineProps<{ highlightedSpecies: HighlightedSpeciesRow[] }>()
const emit = defineEmits<{(e: 'emitClose'): void}>()

watch(() => props.highlightedSpecies, () => { fillExistedSpeciesSlug() })

const store = useStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const selectedProjectId = computed(() => store.selectedProject?.id)

const searchKeyword = ref('')
const searchRisk = ref('')

const selectedSpeciesSlug = ref<string[]>([])

const PAGE_SIZE = 8
const currentPage = ref(1)

const { isLoading: isLoadingSpecies, data: speciesResp } = useSpeciesInProject(apiClientBio, selectedProjectId)
const { isLoading: isLoadingPostSpecies, mutate: mutatePostSpecies } = usePostSpeciesHighlighted(apiClientBio, selectedProjectId)
const { isLoading: isLoadingDeleteSpecies, mutate: mutateDeleteSpecie } = useDeleteSpecieHighlighted(apiClientBio, selectedProjectId)

const speciesList: ComputedRef<HighlightedSpeciesRow[]> = computed(() => {
  if (speciesResp.value === undefined || !speciesResp.value.species.length) {
    return []
  }

  return speciesResp.value.species.map(({ slug, taxonSlug, scientificName, commonName, riskId, photoUrl }) => {
    return {
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? '',
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    }
  })
})

const preSelectedSpecies = computed(() => {
  return speciesList.value.length ? speciesList.value.filter(specie => selectedSpeciesSlug.value.includes(specie.slug)) : []
})

const existingRiskCode = computed(() => {
  return speciesList.value.length ? speciesList.value.map(specie => specie.riskRating).filter((value, index, self) => self.findIndex(({ code }) => code === value.code) === index) : []
})

const existingSlugInDB = computed(() => {
  return props.highlightedSpecies.map(sp => sp.slug)
})

const newSpeciesToAdd = computed(() => {
  const existingSlugsInDB = props.highlightedSpecies.map(sp => sp.slug)
  console.info('newSpeciesToAdd', preSelectedSpecies.value.filter(sp => !existingSlugsInDB.includes(sp.slug)))
  console.info('preSelectedSpecies', preSelectedSpecies.value)
  return preSelectedSpecies.value.filter(sp => !existingSlugsInDB.includes(sp.slug))
})

const speciesLength = computed(() => {
  return speciesListFiltered.value.length
})

const speciesListFiltered = computed(() => {
  if (!searchKeyword.value && searchRisk.value) {
    resetPagination()
    return speciesList.value
      .filter(({ riskRating }) => {
        return riskRating.code === searchRisk.value
      })
      .sort((a, b) => a.scientificName.localeCompare(b.scientificName))
  } else if (searchKeyword.value && !searchRisk.value) {
    resetPagination()
    return speciesList.value
      .filter(({ scientificName, commonName }) => {
        return scientificName.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value.toLowerCase())) ||
          ((commonName?.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value.toLowerCase()))) ?? false)
      })
      .sort((a, b) => a.scientificName.localeCompare(b.scientificName))
    } else if (searchKeyword.value && searchRisk.value) {
      resetPagination()
      return speciesList.value
        .filter(({ scientificName, commonName, riskRating }) => {
          console.info(riskRating.code === searchRisk.value)
          return (scientificName.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value.toLowerCase())) ||
            ((commonName?.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value.toLowerCase()))) ?? false)) &&
            riskRating.code === searchRisk.value
        })
        .sort((a, b) => a.scientificName.localeCompare(b.scientificName))
    } else return speciesList.value
})

const speciesForCurrentPage = computed(() => {
  return speciesListFiltered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
})

const resetPagination = (): void => {
  currentPage.value = 1
}

const resetSearch = (): void => {
  searchKeyword.value = ''
  searchRisk.value = ''
}

const findIndexToRemove = (slug: string): void => {
  const index = selectedSpeciesSlug.value.findIndex(sl => sl === slug)
  selectedSpeciesSlug.value.splice(index, 1)
}

const selectSpecie = async (specie: HighlightedSpeciesRow): Promise<void> => {
  if (isSpecieSelected(specie)) {
    await removeSpecieFromDB(specie.slug)
    findIndexToRemove(specie.slug)
  } else {
    // only 5 species might be highlighted
    if (selectedSpeciesSlug.value.length < 5) {
      selectedSpeciesSlug.value.push(specie.slug)
    }
  }
}

const isSpecieSelected = (specie: HighlightedSpeciesRow): boolean => {
  const slugs = selectedSpeciesSlug.value.filter(slug => slug === specie.slug)
  return slugs.length > 0
}

const removeSpecieFromList = async (specie: SpecieRow): Promise<void> => {
  await removeSpecieFromDB(specie.slug)
  findIndexToRemove(specie.slug)
}

const removeSpecieFromDB = async (slug: string): Promise<void> => {
  const specieToDeleteFromDB = props.highlightedSpecies.find(sp => sp.slug === slug)
  const existingSlugsInDB = props.highlightedSpecies.map(sp => sp.slug)
  if (existingSlugsInDB.includes(slug) && specieToDeleteFromDB) {
    await deleteHighlightedSpecies(specieToDeleteFromDB)
  }
}

const fillExistedSpeciesSlug = (): void => {
  if (props.highlightedSpecies.length) {
    selectedSpeciesSlug.value = existingSlugInDB.value
  } else selectedSpeciesSlug.value = []
}

const filterByCode = (code: string): void => {
  if (searchRisk.value === code) {
    searchRisk.value = ''
  } else searchRisk.value = code
}

const saveHighlightedSpecies = async (): Promise<void> => {
  mutatePostSpecies({ species: newSpeciesToAdd.value }, {
    onSuccess: async () => {
      emit('emitClose')
    }
  })
}

const deleteHighlightedSpecies = async (specie: HighlightedSpeciesRow): Promise<void> => {
  mutateDeleteSpecie({ species: [specie] })
}
</script>
<style lang="scss">
.el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #F9F6F2;
  background: #060508;
}
.el-input__inner {
  padding-left: 2px !important;
}
.tag-selected {
  border: 2px solid #ADFF2C;
  border-style: solid !important;
}
</style>
