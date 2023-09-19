<template>
  <div
    v-if="loading"
    class="mb-4"
  >
    <div>
      <span
        class="inline-block min-h-[1em] w-2/12 text-lg loading-shimmer"
      />
    </div>
    <div>
      <span
        class="inline-block min-h-[1em] w-1/12 text-lg loading-shimmer"
      />
    </div>
  </div>
  <div
    v-else
    class="flex items-center mb-4"
  >
    <div>
      <h3
        class="text-lg"
      >
        {{ species?.commonName }}
      </h3>
      <div
        v-if="species?.scientificName"
        class="text-subtle italic"
      >
        ({{ species?.scientificName }})
      </div>
    </div>
    <el-tag
      v-if="riskInformation"
      class="border-none ml-2"
      effect="dark"
      :color="riskInformation.color"
      :title="riskInformation.label"
    >
      {{ riskInformation.code }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SpeciesInProject, SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import { DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'

const props = withDefaults(defineProps<{ species: SpeciesInProject | SpeciesInProjectTypes['light'] | null, loading: boolean }>(), {
  loading: false
})

const riskInformation = computed(() => {
  // @ts-expect-error riskRatingId is missing from `SpeciesInProjectTypes['light']` but it should be fine when compiled to js since we have the default value and the question mark access
  return RISKS_BY_ID[props.species?.riskRatingId ?? DEFAULT_RISK_RATING_ID]
})
</script>
