<template>
  <div class="graphic-tabs">
    <ol class="text-xl lg:text-2xl xl:text-3xl">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        class="cursor-pointer inline-block p-2 border-b-2 hover:text-frequency hover:border-frequency font-header font-2xl"
        :class="{ 'text-frequency border-frequency border-b-2': selectedTab === tabs[index].value }"
        :aria-selected="selectedTab === tabs[index].value"
        :tabindex="index"
        @click="selectedTab = tabs[index].value"
      >
        {{ tab.label }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

interface Tab {
  label: string
  value: string
}

const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
}

const tabs: Tab[] = [
  { label: 'Species Richness', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', value: TAB_VALUES.detections }
]

const selectedTab = ref(tabs[0].value)

</script>
