<template>
  <div class="grid grid-cols-1 gap-2 bg-stone-900 border-1 border-insight rounded-2xl shadow py-4 px-6 shadow-lg shadow-frequency/10">
    <div class="flex flex-row h-13">
      <h5
        v-if="stat.title"
        class="text-spoonbill text-base font-eyebrow font-medium flex-grow"
      >
        {{ stat.title }}
      </h5>
      <icon-custom-ic-info
        v-if="stat.description"
        :data-tooltip-target="stat.value"
        data-tooltip-style="light"
        class="inline-block basis-8 h-4 w-4 mt-1.25 cursor-pointer text-spoonbill"
      />
      <div
        :id="stat.value"
        role="tooltip"
        class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ stat.description }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3">
      <icon-custom-ft-map-pin-lg
        v-if="stat.value === 'site'"
      />
      <icon-custom-ft-mic-lg
        v-if="stat.value === 'recording'"
      />
      <icon-custom-fi-list
        v-if="stat.value === 'playlist'"
      />
      <icon-custom-ft-actual-bird
        v-if="stat.value === 'species'"
      />
      <icon-fas-spinner
        v-if="stat.isLoading && stat.count === undefined"
        class="animate-spin h-8 w-8 text-white"
      />
      <span
        v-if="stat.count !== undefined"
        class="text-3xl text-white font-header font-medium"
      >{{ valueShortScale }}</span>
    </div>
    <div v-if="stat.value === 'site' && hasPermissionSite">
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
        :href="stat.link"
      >
        {{ stat.label }}
      </a>
    </div>
    <div v-if="stat.value === 'recording' && hasPermissionRecording">
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
        :href="stat.link"
      >
        {{ stat.label }}
      </a>
    </div>
    <div v-if="stat.value === 'playlist' && hasPermissionPlaylist">
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
        :href="stat.link"
      >
        {{ stat.label }}
      </a>
    </div>
    <div v-if="stat.value === 'species' && hasPermissionSpecies">
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-util-gray-01 border-b-1 border-frequency"
        :href="stat.link"
      >
        {{ stat.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { metricValue } from '@rfcx-bio/utils/number'

import { useProjectUserPermissionsStore } from '~/store'
import { type Stat } from '../types'

const props = defineProps<{stat: Stat}>()

const route = useRoute()
const projectUserPermissionsStore = useProjectUserPermissionsStore()

const isProjectMember = computed(() => projectUserPermissionsStore.isMember)
const isViewingAsGuest = computed(() => {
  return route.query.guest === '1' || projectUserPermissionsStore.isExternalGuest
})

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => {
  return props.stat.count === undefined ? '-' : metricValue(props.stat.count)
})

const hasPermissionSite = computed<boolean>(() => {
  return isProjectMember.value && !isViewingAsGuest.value && projectUserPermissionsStore.role !== 'entry'
})

const hasPermissionRecording = computed<boolean>(() => {
  return isProjectMember.value && !isViewingAsGuest.value
})

const hasPermissionPlaylist = computed<boolean>(() => {
  return isProjectMember.value && !isViewingAsGuest.value && projectUserPermissionsStore.role !== 'entry'
})

const hasPermissionSpecies = computed<boolean>(() => {
  return isProjectMember.value && !isViewingAsGuest.value
})

</script>
