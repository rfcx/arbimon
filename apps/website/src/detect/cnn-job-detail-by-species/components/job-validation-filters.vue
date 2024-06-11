<template>
  <div class="grid">
    <div class="flex">
      <span class="flex items-center text-2xl font-medium mr-3">Filters:</span>
      <div class="flex flex-row items-center gap-x-3">
        <div>
          <button
            id="statusDropdownBtn"
            data-dropdown-toggle="statusDropdownHover"
            class="flex flex-row items-center justify-between bg-transparent border-dashed border-1 border-frequency rounded-full text-frequency px-5 py-2 w-41 hover:bg-moss"
            type="button"
            :class="{ '!w-max !border-solid': selectedStatuses.length !== 0 }"
            :title="selectedStatusText"
          >
            <span
              :class="{ 'px-2': selectedStatuses.length !== 0 }"
              class="whitespace-nowrap overflow-hidden max-w-42 3xl:max-w-64 text-ellipsis"
            >
              {{ selectedStatusText }}
            </span>
            <icon-custom-fi-close-thin
              v-if="selectedStatuses.length !== 0"
              class="w-4 h-4 ml-2 cursor-pointer text-frequency"
              @click="onClearStatus()"
            />
            <icon-fa-chevron-down
              v-else
              class="w-2.5 h-2.5 fa-chevron-down text-frequency"
            />
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
                @click="onSelectStatus(status.value)"
              >
                <div
                  class="border-1 rounded-full cursor-pointer bg-moss"
                  :class="{'border-chirp': selectedStatuses.includes(status.value), 'border-transparent': selectedStatuses.includes(status.value) === false}"
                >
                  <div
                    class="flex flex-row gap-x-3 items-center h-10 pl-5"
                  >
                    <ValidationStatus
                      :value="status.value"
                    />
                    {{ status.label }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <button
            id="sitesDropdownButtonCNN"
            data-dropdown-toggle="sitesDropdownCNN"
            class="flex flex-row items-center justify-between bg-transparent border-dashed border-1 border-frequency rounded-full text-frequency px-5 py-2 w-41 hover:bg-moss"
            type="button"
            :class="{ '!border-solid': selectedSites.length !== 0 }"
            :title="selectedSitesTitle"
          >
            <div class="whitespace-nowrap overflow-hidden max-w-42 2xl:max-w-64 text-ellipsis">
              {{ selectedSitesTitle }}
            </div>
            <span>
              <icon-custom-fi-close-thin
                v-if="selectedSites.length !== 0"
                class="w-4 h-4 ml-2 cursor-pointer text-frequency"
                @click="selectedSites = []; filterDetectionsBySite()"
              />
              <icon-fa-chevron-down
                v-else
                class="w-2.5 h-2.5 fa-chevron-down text-frequency"
              />
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
                      @click="onSelectAllSites(); filterDetectionsBySite(); closeSitesDropdown()"
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
                @click="onSelectSite(site.value); filterDetectionsBySite()"
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
                      @click="filterDetectionsBySite()"
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
          </div>
        </div>

        <div>
          <button
            id="groupingDropdownBtn"
            data-dropdown-toggle="groupingDropdownHover"
            class="grouping-dropdown flex flex-row items-center justify-between bg-transparent border-dashed border-1 border-frequency rounded-full text-frequency px-5 py-2 min-w-41 hover:bg-moss"
            :class="{ '!border-solid': selectedGrouping != null }"
            style="position: static !important; transform: none !important; inset: none !important; margin: 0px;"
            type="button"
          >
            <span
              class="whitespace-nowrap overflow-hidden max-w-42 2xl:max-w-80 text-ellipsis"
              :class="{ 'px-2': selectedGrouping }"
              :title="selectedGroupingText"
            >
              {{ selectedGroupingText }}
            </span>
            <icon-custom-fi-close-thin
              v-if="selectedGrouping"
              class="w-4 h-4 ml-2 cursor-pointer text-frequency"
              @click="onClearGroupings"
            />
            <icon-fa-chevron-down
              v-else
              class="w-2.5 h-2.5 fa-chevron-down text-frequency"
            />
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
                v-for="(item) in itemsSelectGrouping"
                :key="item.title"
                class="bg-moss hover:text-util-gray-01"
                @click="selectedGrouping = item.value; groupingDetections(selectedGrouping); closeGroupingDropdown()"
              >
                <div
                  class="border-1 rounded-full cursor-pointer bg-moss"
                  :class="{'border-chirp': selectedGrouping === item.value, 'border-transparent': selectedGrouping !== item.value}"
                >
                  <div
                    class="flex flex-row gap-x-2 items-center h-10 pl-5"
                  >
                    {{ item.title }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isBestDetections"
      class="flex flew-row items-center pt-4 gap-x-2"
    >
      <span class="text-md">
        Display top
      </span>
      <div class="border-0 border-b-1 border-cloud w-14">
        <select
          v-model="displayBestScores"
          class="py-1 pl-2 bg-pitch border-0 appearance-none focus:(ring-0 border-cloud outline-none)"
          @change="onDisplayBestScoresChange(displayBestScores)"
        >
          <option
            v-for="num in 10"
            :key="num"
            :value="num"
          >
            {{ num }}
          </option>
        </select>
      </div>
      <span class="text-md">
        Region of Interests with the best scores
      </span>
    </div>

    <div
      v-if="selectedGrouping === 'minConfidence'"
      class="flex flex-row items-center gap-x-2 pt-3"
    >
      <span class="text-sm">Minimum Confidence:</span>
      <input
        id="minConfidenceCnn"
        v-model.number="currentValue"
        type="number"
        min="0"
        step="0.1"
        max="1"
        class="w-12 text-center text-sm text-pitch bg-util-gray-01 rounded-md outline-none focus:(outline-none ring-util-gray-01) px-1 py-0.5 mr-1 input-hide-arrows"
        @change="onValueChange(currentValue)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dropdown, initDropdowns } from 'flowbite'
import { debounce } from 'lodash-es'
import { type Ref, computed, onMounted, ref, watch } from 'vue'

import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { useDetectionsResultFilterBySpeciesStore } from '~/store'
import ValidationStatus from './../../cnn-job-detail/components/validation-status.vue'

const emit = defineEmits<{(e: 'emitMinConfidence', value: boolean): void, (e: 'emitFilterChanged', groupType: string | undefined, displayBestScores: number): void}>()

const detectionsResultFilterBySpeciesStore = useDetectionsResultFilterBySpeciesStore()
const selectedStatuses = ref<ArbimonReviewStatus[]>([])
const selectedGrouping = ref<string>()
const selectedSites = ref<string[]>([])
let statusDropdown: Dropdown
const sitesDropdown = ref() as Ref<Dropdown>
const groupingDropdown = ref() as Ref<Dropdown>

const statusDropdownHover = ref<HTMLElement | null>(null)
const sitesDropdownCNN = ref<HTMLElement | null>(null)
const groupingDropdownHover = ref<HTMLElement | null>(null)

const itemsSelectGrouping = [
  {
    title: 'Top score per site',
    value: 'topScorePerSite'
  },
  {
    title: 'Top score per site per day',
    value: 'topScorePerSitePerDay'
  },
  {
    title: 'Minimum Confidence',
    value: 'minConfidence'
  }
]

watch(() => detectionsResultFilterBySpeciesStore.filter.minConfidence, (newValue) => {
  currentValue.value = newValue
})

const currentValue = ref<number>(detectionsResultFilterBySpeciesStore.filter.minConfidence)
const displayBestScores = ref<number>(5)
const isBestDetections = computed(() => selectedGrouping.value === 'topScorePerSitePerDay' || selectedGrouping.value === 'topScorePerSite')

const onValueChange = (value: number) => {
  if (value < 0 || value > 1) {
    currentValue.value = detectionsResultFilterBySpeciesStore.filter.minConfidence
    return
  }
  detectionsResultFilterBySpeciesStore.filter.minConfidence = value
}

const onDisplayBestScoresChange = debounce((value: number) => {
  emit('emitFilterChanged', selectedGrouping.value, value)
}, 600)

const closeSitesDropdown = (): void => {
  sitesDropdown.value.hide()
}

const closeGroupingDropdown = (): void => {
  groupingDropdown.value.hide()
}

const filterDetectionsByStatus = debounce((statuses: ArbimonReviewStatus[]) => {
  detectionsResultFilterBySpeciesStore.filter.validationStatuses = statuses
  emit('emitFilterChanged', selectedGrouping.value, displayBestScores.value)
}, 600)

const groupingDetections = async (groupBy: string | undefined) => {
  emit('emitMinConfidence', groupBy === 'minConfidence')
  emit('emitFilterChanged', selectedGrouping.value, displayBestScores.value)
}

const filterDetectionsBySite = debounce(() => {
  const siteIdx = selectedSites.value.includes('all') ? [] : selectedSites.value
  detectionsResultFilterBySpeciesStore.filter.siteIds = siteIdx
  emit('emitFilterChanged', selectedGrouping.value, displayBestScores.value)
}, 600)

const onSelectStatus = (status: ArbimonReviewStatus) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter((s) => s !== status)
  } else {
    selectedStatuses.value = [...selectedStatuses.value, status]
  }
  filterDetectionsByStatus(selectedStatuses.value)
}

const onClearStatus = () => {
  selectedStatuses.value = []
  filterDetectionsByStatus(selectedStatuses.value)
  statusDropdown.hide()
}

const selectedSitesTitle = computed(() => {
  if (selectedSites.value.length === 0) {
    return 'Sites'
  } else if (selectedSites.value.length === 1) {
    const taxonClass = detectionsResultFilterBySpeciesStore.sitesFilterOptions.find(site => site.value === selectedSites.value[0])
    return 'Sites: ' + taxonClass?.label
  } else {
    return `Sites: ${selectedSites.value.length} sites`
  }
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

const onClearGroupings = () => {
  selectedGrouping.value = undefined
  detectionsResultFilterBySpeciesStore.filter.minConfidence = 0.1
  groupingDetections(selectedGrouping.value)
  closeGroupingDropdown()
}

const selectedStatusText = computed(() => {
  if (selectedStatuses.value.length === 0) {
    return 'Validation'
  } else {
    const selectedOptions = selectedStatuses.value.map((status) => {
      return detectionsResultFilterBySpeciesStore.validationStatusFilterOptions.find((option) => option.value === status)?.label
    }).reduce((acc, curr) => acc + ', ' + curr)
    return selectedOptions ? 'Validation: ' + selectedOptions : 'Validation'
  }
})

const selectedGroupingText = computed(() => {
  if (selectedGrouping.value) {
    return 'Grouping: ' + itemsSelectGrouping.find(i => i.value === selectedGrouping.value)?.title
  } else {
    return 'Groupings'
  }
})

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
