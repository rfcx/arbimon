<template>
  <div class="flex flex-row items-center gap-x-3">
    <div>
      <button
        id="statusDropdownBtn"
        data-dropdown-toggle="statusDropdownHover"
        class="flex flex-row items-center justify-between bg-transparent border-1 border-frequency rounded-full text-insight px-5 py-2 w-41"
        type="button"
      >
        <span>Validation</span>
        <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-insight" />
      </button>
      <div
        id="statusDropdownHover"
        class="z-10 hidden rounded-lg p-3 bg-moss w-52 flex flex-col gap-y-3"
      >
        <div class="text-insight flex justify-center whitespace-nowrap px-2">
          Validations status
        </div>
        <div class="border-b-1 border-util-gray-03" />
        <ul
          aria-labelledby="statusDropdownBtn"
          class="flex flex-col gap-y-1"
        >
          <li
            v-for="status in detectionsResultFilterBySpeciesStore.validationStatusFilterOptions"
            :key="status.value"
            class="bg-moss hover:text-util-gray-01"
            @click="selectedStatus = status.value"
          >
            <div
              class="border-1 rounded-full cursor-pointer bg-moss"
              :class="{'border-chirp': selectedStatus === status.value, 'border-transparent': selectedStatus !== status.value}"
            >
              <div
                class="flex flex-row gap-x-3 items-center h-10 pl-5"
              >
                <ValidationStatus
                  v-if="status.value !== 'all'"
                  :value="formatStatus(status.value)"
                />
                {{ status.label }}
              </div>
            </div>
          </li>
        </ul>
        <button
          class="btn btn-primary py-2 h-10 whitespace-nowrap"
          @click="filterDetectionsByStatus(selectedStatus); closeStatusDropdown()"
        >
          Apply filter
        </button>
      </div>
    </div>

    <div>
      <button
        id="sitesDropdownButtonCNN"
        data-dropdown-toggle="sitesDropdownCNN"
        class="flex flex-row items-center justify-between bg-transparent border-1 border-frequency rounded-full text-insight px-5 py-2 w-41"
        type="button"
      >
        <div class="whitespace-nowrap text-ellipsis overflow-hidden">
          {{ selectedSitesTitle ?? 'All sites' }}
        </div>
        <span>
          <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-insight" />
        </span>
      </button>
      <div
        id="sitesDropdownCNN"
        class="z-10 hidden rounded-lg p-3 bg-moss w-52 flex flex-col gap-y-3 max-h-75"
      >
        <ul
          aria-labelledby="sitesDropdownButtonCNN"
          class="flex flex-col gap-y-1 overflow-scroll"
        >
          <li
            class="border-b border-util-gray-03"
            @click="onSelectAllSites"
          >
            <div class="flex p-2 rounded items-center hover:text-util-gray-01">
              <div class="flex">
                <input
                  id="all"
                  :aria-describedby="`class-checkbox-text-all`"
                  type="radio"
                  value="all"
                  class="w-4 h-4 text-frequency border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency"
                  :checked="selectedSites.length === detectionsResultFilterBySpeciesStore.sitesFilterOptions.length"
                  @click="onSelectAllSites"
                >
              </div>
              <div class="ml-2">
                <label :for="`class-checkbox-text-all`">
                  All sites
                </label>
              </div>
            </div>
          </li>
          <li
            v-for="site in detectionsResultFilterBySpeciesStore.sitesFilterOptions"
            :key="site.value"
            @click="onSelectSite(site.value)"
          >
            <div class="flex p-2 rounded items-center hover:text-util-gray-01">
              <div class="flex">
                <input
                  :id="site.value"
                  v-model="selectedSites"
                  :aria-describedby="`site-checkbox-text-${site.value}`"
                  type="checkbox"
                  :value="site.value"
                  class="w-4 h-4 text-frequency border-insight bg-moss rounded ring-1 ring-insight focus:ring-frequency"
                  :checked="selectedSites.includes(site.value)"
                >
              </div>
              <div class="ml-2">
                <label :for="`site-checkbox-text-${site.value}`">
                  {{ site.label }}
                </label>
              </div>
            </div>
          </li>
        </ul>
        <button
          class="btn btn-primary py-2 h-10 whitespace-nowrap"
          @click="filterDetectionsBySite(); closeSitesDropdown()"
        >
          Apply filter
        </button>
      </div>
    </div>

    <div>
      <button
        id="groupingDropdownBtn"
        data-dropdown-toggle="groupingDropdownHover"
        class="grouping-dropdown flex flex-row items-center justify-between bg-transparent border-1 border-frequency rounded-full text-insight px-5 py-2 w-41"
        style="position: static !important; transform: none !important; inset: none !important; margin: 0px;"
        type="button"
      >
        <span>Groupings</span>
        <icon-fa-chevron-down class="w-2.5 h-2.5 fa-chevron-down text-insight" />
      </button>
      <div
        id="groupingDropdownHover"
        class="z-10 hidden rounded-lg p-3 bg-moss w-68 flex flex-col gap-y-3"
      >
        <div class="text-insight flex whitespace-nowrap pl-5">
          Groupings
        </div>
        <div class="border-b-1 border-util-gray-03" />
        <ul
          aria-labelledby="groupingDropdownBtn"
          class="flex flex-col gap-y-1"
        >
          <li
            class="bg-moss hover:text-util-gray-01"
            @click="selectedGrouping = 'minConfidence'"
          >
            <div
              class="border-1 rounded-full cursor-pointer bg-moss"
              :class="{'border-chirp': selectedGrouping === 'minConfidence', 'border-transparent': selectedGrouping !== 'minConfidence'}"
            >
              <div
                class="flex flex-row gap-x-2 items-center h-10 pl-5"
              >
                Minimum Confidence
              </div>
            </div>
          </li>
        </ul>
        <button
          class="btn btn-primary py-2 whitespace-nowrap h-10"
          @click="groupingDetections(selectedGrouping); closeGroupingDropdown()"
        >
          Apply filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { type Ref, computed, onMounted, ref } from 'vue'

import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import ValidationStatus from './../../cnn-job-detail/components/validation-status.vue'

const emit = defineEmits<{(e: 'emitMinConfidence', value: boolean): void}>()

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const selectedStatus = ref<ArbimonReviewStatus | 'all'>('all')
const selectedGrouping = ref<string>()
const selectedSites = ref<string[]>(detectionsResultFilterBySpeciesStore.sitesFilterOptions.map(site => site.value))
let statusDropdown: Dropdown
const sitesDropdown = ref() as Ref<Dropdown>
const groupingDropdown = ref() as Ref<Dropdown>

const statusDropdownHover = ref<HTMLElement | null>(null)
const sitesDropdownCNN = ref<HTMLElement | null>(null)
const groupingDropdownHover = ref<HTMLElement | null>(null)

const closeStatusDropdown = (): void => {
  statusDropdown.hide()
}

const closeSitesDropdown = (): void => {
  sitesDropdown.value.hide()
}

const closeGroupingDropdown = (): void => {
  groupingDropdown.value.hide()
}

const filterDetectionsByStatus = (status: ArbimonReviewStatus | 'all') => {
  detectionsResultFilterBySpeciesStore.filter.validationStatus = status
}

const groupingDetections = (groupBy: string | undefined) => {
  emit('emitMinConfidence', groupBy === 'minConfidence')
}

const filterDetectionsBySite = () => {
  detectionsResultFilterBySpeciesStore.filter.siteIds = selectedSites.value
}

const formatStatus = (status: ArbimonReviewStatus | 'all') => {
  return status as ArbimonReviewStatus
}

const selectedSitesTitle = computed(() => {
  if (selectedSites.value.length === 0) {
    return 'All sites'
  }

  if (selectedSites.value.length === detectionsResultFilterBySpeciesStore.sitesFilterOptions.length) {
    return 'All sites'
  }

  if (selectedSites.value.length === 1) {
    const taxonClass = detectionsResultFilterBySpeciesStore.sitesFilterOptions.find(site => site.value === selectedSites.value[0])
    return taxonClass?.label
  }

  return `${selectedSites.value.length} sites`
})

const onSelectSite = (site: string) => {
  if (selectedSites.value.length === detectionsResultFilterBySpeciesStore.sitesFilterOptions.length) {
    selectedSites.value = [site]
  } else if (selectedSites.value.includes(site)) {
    selectedSites.value = selectedSites.value.filter((s) => s !== site)
  } else {
    selectedSites.value = [...selectedSites.value, site]
  }
}

const onSelectAllSites = () => {
  selectedSites.value = detectionsResultFilterBySpeciesStore.sitesFilterOptions.map(site => site.value)
}

onMounted(() => {
  initDropdowns()
  statusDropdownHover.value = document.getElementById('statusDropdownHover')
  statusDropdown = new Dropdown(
    document.getElementById('statusDropdownHover'),
    document.getElementById('statusDropdownBtn')
  )
  sitesDropdownCNN.value = document.getElementById('sitesDropdownCNN')
  sitesDropdown.value = new Dropdown(
    document.getElementById('sitesDropdownCNN'),
    document.getElementById('sitesDropdownButtonCNN')
  )
  groupingDropdownHover.value = document.getElementById('groupingDropdownHover')
  groupingDropdown.value = new Dropdown(
    document.getElementById('groupingDropdownHover'),
    document.getElementById('groupingDropdownBtn')
  )
})
</script>

<style lang="scss"></style>
