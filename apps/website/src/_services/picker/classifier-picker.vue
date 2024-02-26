<template>
  <select
    id="selected-classifier"
    v-model="selectedClassifier"
    class="bg-pitch border border-frequency text-insight text-sm rounded-md block w-full p-3 font-sans border border-1 focus:border-frequency focus:outline-none focus:ring-0"
  >
    <option
      v-for="classifier in classifierModels"
      :key="classifier.id"
      :value="classifier.id"
      class="w-full"
      :label="classifier.name + ' (v' + classifier.version + ')'"
    />
  </select>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import type { ClassifierAllResponse } from '@rfcx-bio/common/api-core/classifier/classifier-all'

const props = defineProps<{
  classifierModels: ClassifierAllResponse
}>()

const emit = defineEmits<{(e: 'selectedClassifier', value: number): void}>()

const initialValue = props.classifierModels[0]?.id
const selectedClassifier = ref<number | undefined>(initialValue)

watchEffect(() => { emit('selectedClassifier', selectedClassifier.value ?? -1) })
</script>
