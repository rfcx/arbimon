<template>
  <div class="flex px-4 mt-2">
    <div
      class="flex flex-1"
      :title="title"
    >
      <div class="min-w-4">
        <icon-fa-map-marker />
      </div>
      <div class="truncate max-w-24 ml-2">
        {{ title }}
      </div>
    </div>
    <div
      :class="{ 'invisible': isDefaultFilter }"
      @click.stop="$emit('emitRemoveConfig')"
    >
      <icon-fa-close class="cursor-pointer w-3" />
    </div>
  </div>
  <div
    class="flex items-center my-2 px-4"
  >
    <div class="min-w-4">
      <icon-fas-clock />
    </div>
    <div class="ml-2">
      {{ date }}
    </div>
  </div>
  <div
    class="flex items-center py-2 px-4"
    :style="{ 'border-top': `solid 1px ${props.color}`}"
  >
    <div class="min-w-4">
      <icon-fas-filter />
    </div>
    <div class="ml-2 first-letter:capitalize">
      {{ props.taxonFilterText }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, withDefaults } from 'vue'

import { formatDateRange } from '@rfcx-bio/utils/dates'

import { DetectionFilter } from '~/filters/types'

const props = withDefaults(
  defineProps<{
    filter: DetectionFilter | null,
    isDefaultFilter: boolean,
    color: string,
    taxonFilterText: string
  }>(),
  {
    filter: () => null,
    isDefaultFilter: false,
    color: '#FFFFFF',
    taxonFilterText: ''
  }
)

defineEmits<{(e: 'emitRemoveConfig'): void}>()

const title = computed(() => {
  const siteGroups = props.filter?.siteGroups ?? []
  if (siteGroups.length === 0 || siteGroups[0].sites.length === 0) {
    return 'All sites'
  }
  return siteGroups.flatMap(({ label }) => label).join(', ')
})

const date = computed(() => {
  if (!props.filter) return '-'
  return formatDateRange(props.filter.dateStartLocal, props.filter.dateEndLocal)
})
</script>
