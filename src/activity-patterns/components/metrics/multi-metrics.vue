<template>
  <div
    v-for="(item, idx) in datasets"
    :key="'metrics-dataset-' + idx"
  >
    <div class="m-1">
      {{ item.percentage }}%
    </div>
    <div class="relative mb-6 group">
      <div
        class="absolute w-full h-2 rounded-xl opacity-60"
        :style="{ backgroundColor: item.color }"
      />
      <div
        class="h-2 rounded-xl z-5 opacity-80 group-hover:(opacity-100)"
        :style="{ width: item.percentage + '%', backgroundColor: item.color }"
      />
      <p class="absolute min-w-36 mx-auto bg-box-grey mt-2 py-2 px-4 invisible group-hover:visible rounded-md">
        {{ item.description }}
      </p>
    </div>
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
