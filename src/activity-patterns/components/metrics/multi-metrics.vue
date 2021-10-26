<template>
  <div
    v-for="(item, idx) in datasets"
    :key="'metrics-dataset-' + idx"
    class="relative mb-8 group"
  >
    <div class="text-right m-1">
      {{ item.value }}%
    </div>
    <div class="absolute w-full h-4 bg-box-grey rounded-4xl opacity-70" />
    <div
      class="h-4 bg-box-grey rounded-4xl z-5 opacity-90 group-hover:(opacity-100 border-2)"
      :style="{ width: item.value + '%' }"
    />
    <p class="absolute min-w-36 mx-auto bg-box-grey mt-2 py-2 px-4 invisible group-hover:visible rounded-md">
      {{ item.description }}
    </p>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { MetricsDataset } from '@/activity-patterns/types'

export default class SingleDatasetComponent extends Vue {
  @Prop() datasets!: MetricsDataset[]
}
</script>
