<template>
  <div
    id="species-hightlighted-modal"
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
              data-modal-toggle="species-hightlighted-modal"
              @click="$emit('emitClose')"
            >
              <icon-custom-fi-close-thin class="cursor-pointer" />
            </button>
          </div>
          <!-- Modal body -->
          <div class="grid grid-cols-1 gap-y-4 w-3/5">
            <ul
              v-if="speciesList && speciesList.length"
              class="grid grid-cols-2 gap-3"
            >
              <li
                v-for="item in speciesForCurrentPage"
                :key="'dashboard-highlighted-' + item.slug"
                class="flex flex-row justify-between items-center gap-x-3 p-4 h-26 bg-echo"
              >
                <img
                  :src="item.photoUrl"
                  class="min-h-16 h-16 min-w-16 w-16 object-cover rounded bg-util-gray-02"
                >
                <div class="self-center w-36">
                  <p class="text-s italic tracking-tight line-clamp-2">
                    {{ item.scientificName }}
                  </p>
                  <p class="mt-1 text-xs tracking-tight line-clamp-2">
                    {{ item.commonName || 'unknown' }}
                  </p>
                </div>
                <div class="flex items-center">
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
              :total="speciesList.length"
              layout="prev, pager, next"
            />
          </div>
          <!-- Modal footer -->
          <div class="flex flex-row justify-end baseline">
            <button
              data-modal-hide="species-hightlighted-modal"
              type="button"
              class="btn btn-primary group"
            >
              <!-- @click="emitData" -->
              Continue <icon-custom-arrow-right class="ml-2 h-4 w-4 inline text-pitch group-hover:stroke-pitch" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { type ComputedRef, computed, inject, ref } from 'vue'

import { apiClientBioKey } from '@/globals'
import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'
import { useStore } from '~/store'
import { type HighlightedSpeciesRow } from '../../../types/highlighted-species'
import { useSpeciesInProject } from '../composables/use-species-in-project'

defineEmits<{(e: 'emitClose'): void}>()

const store = useStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const selectedProjectId = computed(() => store.selectedProject?.id)
const PAGE_SIZE = 8
const currentPage = ref(1)

const { isLoading: isLoadingSpecies, data: speciesResp } = useSpeciesInProject(apiClientBio, selectedProjectId)

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

const speciesForCurrentPage = computed(() => speciesList.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))
</script>
