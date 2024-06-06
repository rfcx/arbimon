<template>
  <div class="grid grid-cols-1 grid-rows-3 gap-2 bg-stone-900 border-1 border-orange-100 rounded-2xl shadow p-6 dark:border-orange-100 h-46">
    <div class="h-8 flex items-center space-x-2 sm:space-x-3">
      <icon-custom-fi-pm
        v-if="analysis.iconName === 'fi-pm'"
        class="text-white"
      />
      <icon-custom-fi-soundscape
        v-if="analysis.iconName === 'fi-soundscape'"
      />
      <icon-custom-fi-rfm
        v-if="analysis.iconName === 'fi-rfm'"
      />
      <icon-custom-fi-aed
        v-if="analysis.iconName === 'fi-aed'"
        class="text-insight"
      />
      <a
        class="text-xl font-medium text-frequency font-header cursor-pointer border-b-1 border-frequency"
        :href="analysis.link"
        :title="analysis.title"
      >
        {{ analysis.title }}
      </a>
    </div>
    <div class="flex items-center font-body text-xl space-x-2 sm:space-x-3 text-util-gray-01">
      <span v-if="analysis.error === true">- </span>
      <span v-else>{{ analysis.count ? analysis.count : 0 }}</span>
      <span>{{ analysis.label }}</span>
      <icon-custom-ic-loading
        v-if="analysis.isLoading && analysis.count === undefined"
        class="animate-spin h-8 w-8 text-gray-900"
      />
    </div>
    <div
      class="flex items-center font-body text-xl space-x-2 sm:space-x-3 text-util-gray-01"
    >
      <span v-if="analysis.speciesDetectedError === true">- </span>
      <span v-if="analysis.speciesTitle && analysis.speciesDetectedError === false">{{ analysis.speciesDetected ? analysis.speciesDetected : 0 }}</span>
      <span>{{ analysis.speciesTitle }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Analysis } from '../types'

defineProps<{analysis: Analysis}>()

</script>
