<template>
  <!-- TODO #189 Handle error case -->
  <h3 :class="$attrs.class + 'text-lg text-subtle border-b-1 border-subtle pb-1'">
    Description
  </h3>
  <div class="mt-4">
    <div v-if="loading">
      <span
        class="inline-block min-h-[1em] w-5/12 loading-shimmer"
      />
      <span
        class="inline-block min-h-[1em] w-9/12 loading-shimmer"
      />
      <span
        class="inline-block min-h-[1em] w-4/12 loading-shimmer"
      />
    </div>
    <species-information-content
      v-else
      :content="information?.description"
      :redirect-url="information?.sourceUrl"
      :source="information?.sourceCite"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SpeciesInProject, SpeciesInProjectTypes } from '@rfcx-bio/common/dao/types/species-in-project'

import SpeciesInformationContent from './species-information-content.vue'

const props = withDefaults(defineProps<{ speciesInformation: SpeciesInProject | SpeciesInProjectTypes['light'] | null, loading: boolean }>(), {
  loading: false
})

/**
 * Clean up html tag from raw content
 */
const speciesCleanContent = computed(() => {
  // @ts-expect-error description attribute is missing from SpeciesInProjectTypes['light'] type. But it should be fine. We have js guards
  const rawContent = props.speciesInformation?.description ?? ''
  const div = document.createElement('div')
  div.innerHTML = rawContent
  return div.innerText
})

const information = computed(() => {
  return {
    description: speciesCleanContent.value,
    // @ts-expect-error description attribute is missing from SpeciesInProjectTypes['light'] type. But it should be fine. We have js guards
    sourceUrl: props.speciesInformation?.sourceUrl ?? '',
    // @ts-expect-error description attribute is missing from SpeciesInProjectTypes['light'] type. But it should be fine. We have js guards
    sourceCite: props.speciesInformation?.sourceCite ?? ''
  }
})

</script>
