<template>
  <div class="border-1 border-util-gray-01 rounded-md mt-6">
    <div class="p-6">
      <h1 class="flex text-insight">
        Detections
      </h1>
      <div
        class="h-12 w-72 my-6"
      >
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <span class="p-2">
              <icon-custom-ic-search
                class="w-5 h-5 text-insight stroke-insight"
                storke="white"
              />
            </span>
          </div>
          <input
            id="searchSpeciesInput"
            v-model="searchSpeciesKeyword"
            name="search"
            type="text"
            class="search-input text-insight shadow-lg shadow-frequency/10"
            placeholder="Search for species, sounds..."
            @input="searchKeywordChange()"
            @focus="isSearchBoxFocused = true"
            @blur="isSearchBoxFocused = false"
          >
        </div>
      </div>
      <cnn-job-species-detected
        :datasets="results"
        :loading="isLoading"
        :total="total"
        :index="pageNo"
        @emit-sort-paginations="onEmitSortAndPaginations"
      />

      <div
        v-if="errorStatus && !isLoading"
        class="p-10 text-center"
      >
        <h2 v-if="errorStatus.title !== ''" class="font-display flex justify-center mb-4" >{{ errorStatus.title }}</h2>
        <div class="flex justify-center">
          <h4 class="max-w-[80%]">{{ errorStatus.description }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

import type { ClassificationsSummaryDataset } from './job-detection-list.vue'
import CnnJobSpeciesDetected from './job-detection-list.vue'

const props = withDefaults(defineProps<{ isLoading: boolean, total: number, results: ClassificationsSummaryDataset[], jobStatus: number }>(), {
  isLoading: true
})
const emit = defineEmits<{(e: 'emitSearch', keyword: string): void, (e: 'emitSortPaginations', sortKey?: string, pageIndex?: number): void }>()

const searchSpeciesKeyword = ref('')
const isSearchBoxFocused = ref(false)
const sortKeyLabel = ref<string| undefined>()
const pageNo = ref(1)

const ERROR_CASES = [
  { value: 'jobNotComplete', title: 'Hmm, it looks like we couldn\'t find anything...', description: 'The results you requested are currently in progress and are not yet available. Please check back later or contact support if you require further assistance.' },
  { value: 'jobCancelled', title: '', description: 'This job has been cancelled.' },
  { value: 'jobError', title: '', description: 'This job has been error.' },
  { value: 'jobFinished', title: 'Hmm, it looks like we couldn\'t find anything...', description: 'We couldn\'t find any detections in your dataset using the current model. Consider switching to a different model or uploading a new dataset. For further assistance or to explore more options, please contact support.' },
  { value: 'filterApplied', title: 'No results found.', description: 'Your search did not return any matches.' }
]

const errorStatus = computed(() => {
  let statueError = ''
  if (props.jobStatus === CLASSIFIER_JOB_STATUS.WAITING || props.jobStatus === CLASSIFIER_JOB_STATUS.RUNNING) {
    statueError = 'jobNotComplete'
  } else if (props.jobStatus === CLASSIFIER_JOB_STATUS.CANCELLED || props.jobStatus === CLASSIFIER_JOB_STATUS.AWAITING_CANCELLATION) {
    statueError = 'jobCancelled'
  } else if (props.jobStatus === CLASSIFIER_JOB_STATUS.ERROR) {
    statueError = 'jobError'
  } else if (props.results.length === 0 && props.jobStatus === CLASSIFIER_JOB_STATUS.DONE && searchSpeciesKeyword.value === '') {
    statueError = 'jobFinished'
  } else if (props.results.length === 0 && searchSpeciesKeyword.value !== '') {
    statueError = 'filterApplied'
  } else {
    statueError = ''
  }
  return ERROR_CASES.find(e => e.value === statueError)
})

const searchKeywordChange = async () => {
  pageNo.value = 1
  emit('emitSearch', searchSpeciesKeyword.value)
}

const onEmitSortAndPaginations = async (sortKey?: string, pageIndex?: number) => {
  sortKeyLabel.value = sortKey
  pageNo.value = pageIndex ?? 1
  emit('emitSortPaginations', sortKey, pageIndex)
}

</script>

<style scoped lang="scss">
#searchSpeciesInput {
  padding-inline-start: 2rem;
}
</style>
