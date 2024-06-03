<template>
  <h2>Conservation status</h2>
  <h6>Threatened species detected in this project based on the IUCN Red List.</h6>
  <div class="dashboard-species">
    <div
      v-if="isLoading"
      class="loading-shimmer rounded-xl mt-6 p-4 min-w-32"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <!-- <div
      v-for="n in 4"
      class="loading-shimmer rounded-xl p-4 min-w-32 <sm:min-w-24 grow flex-1"
    >
      <p class="font-bold text-4xl <sm:text-2xl">
        &nbsp;
      </p>
      <p>&nbsp;</p>
    </div> -->
    </div>
    <div
      v-else-if="isError"
      class="w-full text-center items-center rounded-lg p-4 shadow bg-util-gray-04 border border-util-gray-02 mt-3"
    >
      <span>
        It seems the section didn’t load as expected.Please refresh your browser to give it another go.
      </span>
    </div>
    <div
      v-else-if="richnessByRisk"
      class="threatened-species"
    >
      <StackDistribution
        :dataset="richnessByRisk"
        :known-total-count="knownTotalCount"
        :selected-id="selectedRisk ?? -1"
        :view-only="false"
        class="my-6"
        @emit-select-item="onEmitSelectRiskRating"
      />
    </div>
    <SpeciesList
      :selected-risk="selectedRisk"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import StackDistribution from './components/stack-distribution.vue'
import { type HorizontalStack } from './components/stack-distribution.vue'
import SpeciesList from './dashboard-species-list.vue'

const props = defineProps<{ isLoading: boolean, isError: boolean, richnessByRisk: HorizontalStack[], knownTotalCount: string }>()

const defaultSelectedRisk = computed(() => {
  const risks = props.richnessByRisk.map(({ id }) => id)
  if (risks.length === 0) return null
  return Math.max(...risks)
})

const selectedRisk = ref(defaultSelectedRisk.value)

watch(() => props.richnessByRisk, () => {
  if (selectedRisk.value === null) {
    selectedRisk.value = defaultSelectedRisk.value
  }
})

const onEmitSelectRiskRating = (id: number) => {
  selectedRisk.value = id
}

</script>
