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
            class="bg-moss px-2 hover:text-util-gray-01"
            @click="selectedStatus = status.value"
          >
            <div
              class="flex flex-row gap-x-2 items-center border-1 rounded-md cursor-pointer bg-moss h-10 px-2"
              :class="{'border-frequency': selectedStatus === status.value, 'border-transparent': selectedStatus !== status.value}"
            >
              <icon-custom-fi-unvalidated
                v-if="status.value === 'unvalidated'"
                class="h-4 w-4"
              />
              <icon-custom-fi-present
                v-if="status.value === 'present'"
                class="h-4 w-4"
              />
              <icon-custom-fi-not-present
                v-if="status.value === 'notPresent'"
                class="h-4 w-4"
              />
              <icon-custom-fi-unknown
                v-if="status.value === 'unknown'"
                class="h-4 w-4"
              />
              {{ status.label }}
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
        <span>{{ selectedSitesTitle }}</span>
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
        <div class="text-insight flex whitespace-nowrap px-2">
          Groupings
        </div>
        <div class="border-b-1 border-util-gray-03" />
        <ul
          aria-labelledby="groupingDropdownBtn"
          class="flex flex-col gap-y-1"
        >
          <li
            class="bg-moss px-2 border-1 rounded-md cursor-pointer hover:text-util-gray-01"
            :class="{'border-frequency': selectedGrouping === 'minConfidence', 'border-transparent': selectedGrouping !== 'minConfidence'}"
            @click="selectedGrouping = 'minConfidence'"
          >
            Minimum Confidence
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
  console.info('grouping detections', groupBy)
  detectionsResultFilterBySpeciesStore.filter.minConfidence = 0.5
}

const filterDetectionsBySite = () => {
  detectionsResultFilterBySpeciesStore.filter.siteIds = selectedSites.value
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
