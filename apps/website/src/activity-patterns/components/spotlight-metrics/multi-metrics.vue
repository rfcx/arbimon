<template>
  <div
    v-for="(item, idx) in datasets"
    :key="'metrics-dataset-' + idx"
    class="group"
  >
    <div class="first:mt-4 hover:cursor-default">
      {{ item.value }}
    </div>
    <div class="relative mb-6">
      <div
        class="absolute w-full h-2 rounded-xl opacity-60"
        :style="{ backgroundColor: store.datasetColors[idx] }"
      />
      <div
        class="h-2 rounded-xl z-5 opacity-80 group-hover:(opacity-100)"
        :style="{ width: getWidth(item.value) + '%', backgroundColor: store.datasetColors[idx] }"
      />
      <p class="absolute min-w-36 z-10 mx-auto bg-box-grey mt-2 py-2 px-4 invisible group-hover:visible rounded-md">
        {{ item.description }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'

import { MetricsDataset } from '@/activity-patterns/types'
import { storeKey } from '@/globals'
import { BiodiversityStore } from '~/store'

export default class SingleDatasetComponent extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop() datasets!: MetricsDataset[]

  getWidth (value: string): number {
    return Number(value) * 100
  }
}
</script>
