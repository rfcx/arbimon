<template>
  <div
    id="species-highlighted-modal"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-4/5 max-h-full">
      <div class="relative p-6 bg-white rounded-lg shadow dark:bg-moss">
        <div class="flex flex-col gap-y-4">
          <!-- Modal header -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-y-3">
              <h2>Highlighted species</h2>
              <h6 class="text-util-gray-01">
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
          <div class="grid sm:grid-cols-1 md:(grid-cols-2 mr-4) xl:(grid-cols-3 mr-4) ">
            <el-input
              v-model="searchKeyword"
              placeholder="Search species"
              size="large"
              class="bg-mock grid col-span-1"
            >
              <template #prefix>
                <div class="inline-flex items-center">
                  <icon-fas-search class="text-base text-insight" />
                </div>
              </template>
            </el-input>
          </div>
          <div class="grid xl:grid-cols-3 items-center gap-x-2 my-1">
            <button
              id="dropdownButton"
              data-dropdown-toggle="dropdown"
              class="bg-echo text-frequency w-30 text-xs rounded-full flex col-span-2 flex-row items-center py-1 px-2"
              type="button"
            >
              IUCN status
              <span class="pl-3">
                <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
                <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
              </span>
            </button>
            <div
              id="dropdown"
              class="z-10 hidden bg-echo divide-y divide-util-gray-02 rounded-lg shadow w-15"
            >
              <ul
                aria-labelledby="dropdownButton"
                class="p-2 space-y-3"
              >
                <li
                  v-for="(riskRating, index) in existingRiskCode"
                  :key="riskRating.code"
                  @click="filterByCode(existingRiskCode[index].code)"
                >
                  <el-tag
                    class="species-highlights border-none cursor-pointer text-md select-none h-6"
                    :class="searchRisk === existingRiskCode[index].code ? 'tag-selected' : ''"
                    effect="dark"
                    size="large"
                    :color="riskRating.color"
                    :title="riskRating.label"
                  >
                    {{ riskRating.code }}
                  </el-tag>
                </li>
              </ul>
            </div>
            <div class="xl:grid col-span-1 flex-row hidden ml-2 font-medium">
              <h4>Selected species</h4>
            </div>
          </div>
          <!-- Modal body -->
          <div class="grid gap-x-4 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <div class="grid grid-cols-1 gap-y-4 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
              <ul
                v-if="speciesList && speciesList.length"
                class="grid gap-3 grid-cols-1 md:grid-rows-5 md:(grid-cols-2 grid-rows-5)"
              >
                <li
                  v-for="item in speciesForCurrentPage"
                  :key="'specie-highlighted-' + item.slug"
                  :class="isSpecieSelected(item) ? 'border-frequency' : 'border-transparent'"
                  class="flex flex-row justify-center border-1 items-center rounded-lg space-x-3 p-4 h-full h-23 md:(flex-row) lg:(flex-row justify-between) bg-echo hover:(border-frequency cursor-pointer)"
                  @click="selectSpecie(item)"
                >
                  <SpecieCard
                    :slug="item.slug"
                    :scientific-name="item.scientificName"
                    :common-name="item.commonName"
                    :photo-url="item.photoUrl"
                    :redirect="false"
                    :text-black="false"
                  />
                  <div class="self-center">
                    <el-tag
                      class="species-highlights border-none text-md h-6"
                      effect="dark"
                      size="large"
                      :color="item.riskRating.color"
                      :title="item.riskRating.label"
                      :style="{ color: item.riskRating.text }"
                    >
                      {{ item.riskRating.code }}
                    </el-tag>
                  </div>
                </li>
              </ul>
              <icon-custom-ic-loading
                v-if="isLoadingSpecies"
                class="animate-spin w-8 h-8 lg:mx-24 mx-12"
              />
              <h6 v-if="!speciesList.length">
                No species in a project.
              </h6>
              <el-pagination
                v-if="speciesList.length"
                v-model:currentPage="currentPage"
                class="flex items-center justify-center mb-2"
                :page-size="PAGE_SIZE"
                :total="speciesLength"
                layout="prev, pager, next"
                @current-change="handleCurrentChange"
              />
            </div>
            <div
              v-if="preSelectedSpecies.length === 0"
              class="hidden grid-cols-1 xl:grid h-127 border-1 border-dashed rounded-lg"
            >
              <div class="my-auto items-center p-5 text-center">
                <h4 class="font-medium">
                  No species are selected.
                </h4>
                <p class="mt-4">
                  Find and select focal species to emphasize in your project.
                </p>
              </div>
            </div>
            <div
              v-else
              class="hidden grid-cols-1 xl:grid"
            >
              <HighlightedSpeciesSelector
                :species="preSelectedSpecies"
                @emit-remove-specie="removeSpecieFromList"
              />
            </div>
          </div>
          <!-- Modal footer -->
          <div class="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            <div class="grid gap-3 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-3">
              <div v-if="showHaveReachedLimit">
                <span class="ml-3 bg-danger-background inline-flex text-echo items-center p-3 border-1 border-rose-600 border-l-3 rounded-lg">
                  <icon-custom-ic-error-message class="<xl:basis-2/12" />
                  You have reached the limit of 5 highlighted species allowed.
                </span>
              </div>
            </div>
            <div class="flex flex-row justify-end baseline col-span-1 mt-4 md:m-auto">
              <button
                data-modal-hide="species-highlighted-modal"
                type="button"
                class="btn btn-primary group h-12"
                @click="saveHighlightedSpecies"
              >
                Select species
                <icon-custom-ic-loading
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
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'

import type { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { type ProjectSpeciesFieldSet, type ProjectSpeciesResponse, apiBioGetProjectSpecies } from '@rfcx-bio/common/api-bio/species/project-species-all'

import { apiClientKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import { useDeleteSpecieHighlighted, usePostSpeciesHighlighted } from '../composables/use-post-highlighted-species'
import HighlightedSpeciesSelector, { type SpecieRow } from './highlighted-species-selector.vue'
import SpecieCard from './species-card.vue'

const props = defineProps<{ highlightedSpecies: HighlightedSpeciesRow[], toggleShowModal: boolean }>()
const emit = defineEmits<{(e: 'emitClose'): void}>()

watch(() => props.highlightedSpecies, () => {
  fillExistingSpeciesSlug()
})

const store = useStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance

const selectedProjectId = computed(() => store.selectedProject?.id)

const searchKeyword = ref('')
const searchRisk = ref('')
const showHaveReachedLimit = ref(false)
const isLoadingSpecies = ref(false)
const hasFetchedAll = ref(false)

const selectedSpeciesSlug = ref<string[]>([])

const PAGE_SIZE = 10
const currentPage = ref(1)
const totalProjectsSpecies = ref(0)

const speciesList = ref<HighlightedSpeciesRow[]>([])
watch(() => props.toggleShowModal, async () => {
  fillExistingSpeciesSlug()
  speciesList.value = []
  await fetchProjectsSpecies(PAGE_SIZE, 0)
})

const handleCurrentChange = async (page: number) => {
  if (!hasFetchedAll.value && (page * PAGE_SIZE) > speciesList.value.length) {
    await fetchProjectsSpecies(PAGE_SIZE, speciesList.value.length)
  }
}

const fetchProjectsSpecies = async (limit: number, offset: number) => {
  isLoadingSpecies.value = true

  if (selectedProjectId.value === undefined) return
  const fields: ProjectSpeciesFieldSet = 'dashboard'
  const projectSpecies = await apiBioGetProjectSpecies(apiClientBio, selectedProjectId.value, { limit, offset, fields })

  if (projectSpecies === undefined) {
    isLoadingSpecies.value = false
    return
  }

  const s = projectSpecies as ProjectSpeciesResponse
  hasFetchedAll.value = s.species.length < limit // check if reaching the end
  totalProjectsSpecies.value = s.total

  s.species.forEach(sp => {
    const { slug, taxonSlug, scientificName, commonName, photoUrl, riskId } = sp as DashboardSpecies
    speciesList.value.push({
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? '',
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    })
  })
  isLoadingSpecies.value = false
}

const { isPending: isLoadingPostSpecies, mutate: mutatePostSpecies } = usePostSpeciesHighlighted(apiClientBio, selectedProjectId)
const { isPending: isLoadingDeleteSpecies, mutate: mutateDeleteSpecie } = useDeleteSpecieHighlighted(apiClientBio, selectedProjectId)

// Filtered list of species by search, risk or both
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

const speciesLength = computed(() => {
  return totalProjectsSpecies.value !== 0 ? totalProjectsSpecies.value : speciesListFiltered.value.length
})

const speciesForCurrentPage = computed(() => {
  return speciesListFiltered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
})

const preSelectedSpecies = computed(() => {
  return speciesList.value.length ? selectedSpeciesSlug.value.map((slug) => speciesList.value.filter((specie) => specie.slug === slug)[0]) ?? [] : []
})

const existingRiskCode = computed(() => {
  return speciesList.value.length ? speciesList.value.map(specie => specie.riskRating).filter((value, index, self) => self.findIndex(({ code }) => code === value.code) === index) : []
})

const newSpeciesToAdd = computed(() => {
  const existingSlugsInDB = props.highlightedSpecies.map(sp => sp.slug)
  return preSelectedSpecies.value.filter(sp => !existingSlugsInDB.includes(sp.slug))
})

const speciesToRemove = computed(() => {
  const preSelectedSpeciesSlug = preSelectedSpecies.value.map(sp => sp.slug)
  return props.highlightedSpecies.filter(sp => !preSelectedSpeciesSlug.includes(sp.slug))
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
    findIndexToRemove(specie.slug)
    showHaveReachedLimit.value = selectedSpeciesSlug.value.length >= 5
  } else {
    // only 5 species might be highlighted
    if (selectedSpeciesSlug.value.length < 5) {
      selectedSpeciesSlug.value.push(specie.slug)
    } else {
      showHaveReachedLimit.value = true
    }
  }
}

const isSpecieSelected = (specie: HighlightedSpeciesRow): boolean => {
  const slugs = selectedSpeciesSlug.value.filter(slug => slug === specie.slug)
  return slugs.length > 0
}

const removeSpecieFromList = async (specie: SpecieRow): Promise<void> => {
  showHaveReachedLimit.value = false
  findIndexToRemove(specie.slug)
}

const fillExistingSpeciesSlug = (): void => {
  if (props.highlightedSpecies.length) {
    selectedSpeciesSlug.value = props.highlightedSpecies.map(sp => sp.slug)
  } else selectedSpeciesSlug.value = []
}

const filterByCode = (code: string): void => {
  if (searchRisk.value === code) {
    searchRisk.value = ''
  } else searchRisk.value = code
}

const saveHighlightedSpecies = async (): Promise<void> => {
  if (speciesToRemove.value.length) await deleteHighlightedSpecies()
  if (newSpeciesToAdd.value.length) await addHighlightedSpecies()
}

const deleteHighlightedSpecies = async (): Promise<void> => {
  mutateDeleteSpecie({ species: speciesToRemove.value }, {
    onSuccess: async () => {
      if (!newSpeciesToAdd.value.length) {
        emit('emitClose')
      }
    }
  })
}

const addHighlightedSpecies = async (): Promise<void> => {
  mutatePostSpecies({ species: newSpeciesToAdd.value }, {
    onSuccess: async () => {
      emit('emitClose')
    }
  })
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
