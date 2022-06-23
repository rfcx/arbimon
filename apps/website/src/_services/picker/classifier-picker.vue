<template>
  <el-select
    v-model="selectedClassifier"
    filterable
    placeholder="Select classifier"
    no-data-text="No matching classifiers"
    class="block w-full"
    size="large"
  >
    <el-option
      v-for="classifier in classifierModels"
      :key="classifier.id"
      :value="classifier.id"
      class="my-0.5"
      :label="classifier.name + ' (v' + classifier.version + ')'"
    />
  </el-select>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { ClassifierAllResponse } from '@rfcx-bio/common/api-core/classifier/classifier-all'

const props = defineProps<{
  classifierModels: ClassifierAllResponse
}>()

const emit = defineEmits<{(e: 'selectedClassifier', value: number): void}>()

const initialValue = props.classifierModels[0]?.id
const selectedClassifier = ref<number | undefined>(initialValue)

watchEffect(() => { emit('selectedClassifier', selectedClassifier.value ?? -1) })
</script>
