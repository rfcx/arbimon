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
        <div
          v-if="!highlightedSpecies"
          class="flex items-center justify-center h-screen text-center"
        >
          <span>
            It seems the page didn’t load as expected.<br>
            Please refresh your browser to give it another go.
          </span>
        </div>
        <div
          v-else
          class="flex flex-col gap-y-4"
        >
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
              @click="$emit('emitClose')"
            >
              <icon-custom-fi-close-thin class="cursor-pointer text-insight" />
            </button>
          </div>

          <div>
            <div
              class="grid sm:grid-cols-1 md:(grid-cols-2 mr-4) xl:(grid-cols-3 mr-4)"
            >
              <div class="relative">
                <div class="absolute inset-y-0 start-2 flex items-center ps-3 pointer-events-none">
                  <span class="p-2">
                    <icon-custom-ic-search
                      class="w-5 h-5 text-insight stroke-insight"
                      storke="white"
                    />
                  </span>
                </div>
                <input
                  id="speciesSearchInput"
                  v-model="searchKeyword"
                  name="search"
                  type="text"
                  class="search-input text-insight shadow-lg shadow-frequency/10"
                  placeholder="Search species"
                  @input="searchSpeciesInputChanged"
                  @focus="isSearchBoxFocused = true"
                  @blur="isSearchBoxFocused = false"
                >
              </div>
            </div>
          </div>
          <div class="grid xl:grid-cols-3 items-center gap-x-2 my-1">
            <button
              id="dropdownButton"
              data-dropdown-toggle="dropdown"
              class="bg-echo text-frequency w-36 text-xs rounded-full flex col-span-2 flex-row items-center py-2 px-4 justify-between"
              type="button"
            >
              IUCN status {{ searchRisk ? ': ' + existingRisk.find(r => r.id === searchRisk)?.code : '' }}
              <span>
                <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
                <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
              </span>
            </button>
            <div
              id="dropdown"
              class="z-10 hidden bg-echo divide-y divide-util-gray-02 rounded-lg shadow w-50 p-3"
            >
              <div
                class="border-b border-fog/40 cursor-pointer"
                @click="clearSearchRisk"
              >
                <div class="flex p-2 rounded items-center hover:bg-util-gray-04/60">
                  <div class="flex">
                    <input
                      id="all"
                      :aria-describedby="`class-checkbox-text-all`"
                      type="radio"
                      value="all"
                      class="w-4 h-4 text-frequency border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency"
                      :checked="searchRisk === undefined"
                      @click="clearSearchRisk"
                    >
                  </div>
                  <div class="ml-2">
                    <label
                      :for="`class-checkbox-text-all`"
                      class="cursor-pointer"
                    >
                      All status
                    </label>
                  </div>
                </div>
              </div>
              <ul
                aria-labelledby="dropdownButton"
                class="pt-3 gap-2 grid grid-cols-4"
              >
                <li
                  v-for="(riskRating, index) in existingRisk"
                  :key="riskRating.code"
                  class="items-center"
                  @click="filterByCode(existingRisk[index].id)"
                >
                  <div
                    class="h-6 cursor-pointer text-md text-center select-none px-2 rounded-sm self-center"
                    :class="searchRisk === existingRisk[index].id ? 'border-1 border-frequency' : ''"
                    :style="{ color: riskRating.text, background: riskRating.color }"
                  >
                    {{ riskRating.code }}
                  </div>
                </li>
              </ul>
            </div>
            <div class="xl:grid col-span-1 flex-row hidden ml-2 font-medium">
              <h4>Selected species</h4>
            </div>
          </div>
          <!-- Modal body -->
          <div class="grid gap-x-4 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <div
              v-if="isLoadingSpecies"
              class="grid grid-cols-1 gap-y-4 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 items-center m-auto"
            >
              <icon-custom-ic-loading
                class="animate-spin w-8 h-8 lg:mx-24 mx-12"
              />
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-y-4 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 items-center text-center"
            >
              <div v-if="!speciesForCurrentPage.length">
                <h6>
                  No species found.
                </h6>
                <span class="text-xs">
                  Please check your spelling or try different search terms. <br>
                  If the species isn’t listed in Arbimon’s database, consider reaching out to our support team to request its addition.
                </span>
              </div>
              <div v-else>
                <div
                  v-if="!speciesForCurrentPage.length"
                  class="items-center text-center"
                >
                  It seems the species didn’t load as expected.<br>
                  Please refresh your browser to give it another go.
                </div>
                <ul
                  v-else
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
                      <div
                        class="species-highlights border-none text-md h-6 px-2 rounded-sm self-center"
                        :style="{ color: item.riskRating.text, background: item.riskRating.color }"
                      >
                        {{ item.riskRating.code }}
                      </div>
                    </div>
                  </li>
                </ul>
                <div
                  v-show="speciesForCurrentPage.length"
                  class="flex justify-end items-center mt-4"
                >
                  <div>
                    <input
                      v-model.number="currentPage"
                      type="number"
                      min="1"
                      :max="maxPage"
                      class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
                    >
                    of
                    <span class="ml-1.5">{{ maxPage }}</span>
                  </div>
                  <button
                    class="btn btn-icon ml-4"
                    @click="setPage(currentPage - 1)"
                  >
                    <icon-fas-chevron-left class="w-3 h-3" />
                  </button>
                  <button
                    class="btn btn-icon ml-2"
                    @click="setPage(currentPage + 1)"
                  >
                    <icon-fas-chevron-right class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="selectedSpecies.length === 0"
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
                :species="selectedSpecies"
                @emit-remove-specie="findIndexToRemove"
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
          <div
            v-if="saveError"
            class="text-danger text-right"
          >
            <p class="text-xs">
              <span class="font-medium">A Server Error Occurred.</span> We encountered some issues while saving your selected species. Could you please try again?
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import debounce from 'lodash.debounce'
import { computed, inject, ref, watch } from 'vue'

import type { DashboardSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { type ProjectSpeciesFieldSet, type ProjectSpeciesResponse, apiBioGetProjectSpecies } from '@rfcx-bio/common/api-bio/species/project-species-all'

import { apiClientKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useHighlightedSpeciesStore, useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import { useDeleteSpecieHighlighted, usePostSpeciesHighlighted } from '../composables/use-post-highlighted-species'
import HighlightedSpeciesSelector from './highlighted-species-selector.vue'
import SpecieCard from './species-card.vue'

const props = defineProps<{ highlightedSpecies: HighlightedSpeciesRow[], toggleShowModal: boolean }>()
const emit = defineEmits<{(e: 'emitClose'): void}>()

const store = useStore()
const pdStore = useHighlightedSpeciesStore()
const selectedProjectId = computed(() => store.project?.id)
const speciesFromStore = computed(() => pdStore.getSpeciesByPage(currentPage.value, PAGE_SIZE))

const apiClientBio = inject(apiClientKey) as AxiosInstance
const { isPending: isLoadingPostSpecies, mutate: mutatePostSpecies } = usePostSpeciesHighlighted(apiClientBio, selectedProjectId)
const { isPending: isLoadingDeleteSpecies, mutate: mutateDeleteSpecie } = useDeleteSpecieHighlighted(apiClientBio, selectedProjectId)
const isLoadingSpecies = ref(false)

const searchKeyword = ref<string>()
const searchRisk = ref<number>()
const isSearchBoxFocused = ref(false)

const speciesForCurrentPage = ref<HighlightedSpeciesRow[]>([])
const highlightedSpeciesSelected : HighlightedSpeciesRow[] = []
const selectedSpecies = ref<HighlightedSpeciesRow[]>([])

const showHaveReachedLimit = ref(false)
const PAGE_SIZE = 10
const currentPage = ref(1)
const total = ref(0)

// default state, starting points
watch(() => props.toggleShowModal, async () => {
  setDefaultDisplay()

  pdStore.updateSelectedProjectId(selectedProjectId.value ?? -1)
  getSpeciesWithPage()
  props.highlightedSpecies.forEach(s => highlightedSpeciesSelected.push(s))
})

watch(currentPage, () => {
  getSpeciesWithPage()
})

const setDefaultDisplay = () => {
  currentPage.value = 1
  searchKeyword.value = undefined
  searchRisk.value = undefined
  highlightedSpeciesSelected.length = 0
  selectedSpecies.value = props.highlightedSpecies
  speciesForCurrentPage.value = []
}

const clearSearchRisk = (): void => {
  currentPage.value = 1
  searchRisk.value = undefined
  getSpeciesWithPage()
}

const maxPage = computed((): number => {
    return Math.ceil(total.value / PAGE_SIZE)
})

const existingRisk = computed(() => {
  const allSpeciesRiskID = Object.keys(RISKS_BY_ID).map(Number)
  return allSpeciesRiskID.map((id: number) => {
      return {
        id,
        name: RISKS_BY_ID[id].label,
        color: RISKS_BY_ID[id].color,
        code: RISKS_BY_ID[id].code,
        text: RISKS_BY_ID[id].text
      }
    })
})

// APIs calls
const fetchProjectsSpecies = async (limit: number, offset: number, keyword?: string, riskRatingId?: string) => {
  if (keyword !== undefined || riskRatingId !== undefined) {
    isLoadingSpecies.value = true
  } else {
    if (speciesFromStore.value.length === 0) {
      isLoadingSpecies.value = true
    }
  }

  if (selectedProjectId.value === undefined) return
  const fields: ProjectSpeciesFieldSet = 'dashboard'
  const projectSpecies = await apiBioGetProjectSpecies(apiClientBio, selectedProjectId.value, { limit, offset, fields, keyword, riskRatingId })

  if (projectSpecies === undefined) {
    isLoadingSpecies.value = false
    return
  }
  const s = projectSpecies as ProjectSpeciesResponse
  total.value = s.total
  if (speciesFromStore.value.length !== 0 && keyword === undefined && riskRatingId === undefined) return
  speciesForCurrentPage.value = []
  s.species.forEach(sp => {
    const { slug, taxonSlug, scientificName, commonName, photoUrl, riskId } = sp as DashboardSpecies
    speciesForCurrentPage.value.push({
      slug,
      taxonSlug,
      scientificName,
      commonName,
      photoUrl: photoUrl ?? '',
      riskRating: RISKS_BY_ID[riskId ?? DEFAULT_RISK_RATING_ID]
    })
  })
  isLoadingSpecies.value = false
  if (keyword === undefined && riskRatingId === undefined) {
    pdStore.updateSpecies(speciesForCurrentPage.value, offset, s.total)
  }
}

// add & remove species logic
const selectSpecie = async (specie: HighlightedSpeciesRow): Promise<void> => {
  if (isSpecieSelected(specie)) {
    findIndexToRemove(specie.slug)
  } else {
    // only 5 species might be highlighted
    if (selectedSpecies.value.length < 5) {
      selectedSpecies.value.push(specie)
    } else {
      showHaveReachedLimit.value = selectedSpecies.value.length >= 5
    }
  }
}

const isSpecieSelected = (specie: HighlightedSpeciesRow): boolean => {
  return selectedSpecies.value.find(s => s.slug === specie.slug) !== undefined
}

const newSpeciesToAdd = computed(() => {
  return selectedSpecies.value.filter(s => highlightedSpeciesSelected.filter(sp => s.slug === sp.slug).length === 0)
})

const speciesToRemove = computed(() => {
  return highlightedSpeciesSelected.filter(sp => selectedSpecies.value.filter(s => s.slug === sp.slug).length === 0)
})

const findIndexToRemove = (slug: string): void => {
  const index = selectedSpecies.value.findIndex(s => s.slug === slug)
  selectedSpecies.value.splice(index, 1)
  showHaveReachedLimit.value = selectedSpecies.value.length >= 5
}

const saveError = ref(false)
const saveHighlightedSpecies = async (): Promise<void> => {
  saveError.value = false
  try {
    if (speciesToRemove.value.length) await deleteHighlightedSpecies()
    if (newSpeciesToAdd.value.length) await addHighlightedSpecies()
    if (!speciesToRemove.value.length && !newSpeciesToAdd.value.length) emit('emitClose')
  } catch (error) {
    saveError.value = true
  }
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

// search logic
const searchSpeciesInputChanged = debounce(async () => {
  currentPage.value = 1
  searchKeyword.value = searchKeyword.value === '' ? undefined : searchKeyword.value
  getSpeciesWithPage()
}, 500)

const filterByCode = (riskId: number): void => {
  currentPage.value = 1

  if (searchRisk.value === riskId) {
    searchRisk.value = undefined
  } else searchRisk.value = riskId
  fetchProjectsSpecies(PAGE_SIZE, (currentPage.value - 1) * PAGE_SIZE, searchKeyword.value, riskId.toString())
}

// pagination logic
const getSpeciesWithPage = () => {
  isLoadingSpecies.value = true
  if (speciesFromStore.value.length === 0 || searchKeyword.value !== undefined || searchRisk.value !== undefined) {
    fetchProjectsSpecies(PAGE_SIZE, (currentPage.value - 1) * PAGE_SIZE, searchKeyword.value, searchRisk.value?.toString())
  } else {
    total.value = pdStore.totalSpecies
    isLoadingSpecies.value = false
    speciesForCurrentPage.value = speciesFromStore.value
  }
}

const setPage = (page: number) => {
    let newPage = page
    if (page < 1) newPage = maxPage.value
    if (page > maxPage.value) newPage = 1

    currentPage.value = newPage
}

</script>
<style lang="scss">
#speciesSearchInput {
  padding-inline-start: 2rem;
}
</style>
