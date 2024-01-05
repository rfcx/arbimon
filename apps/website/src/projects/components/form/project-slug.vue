<template>
  <div class="mt-6">
    <div class="flex flex-row">
      <label
        for="name"
        class="block mb-2 font-medium text-gray-900 dark:text-insight"
      >Insight URL*</label>
      <icon-i-info
        tooltip-id="project-name"
        :tooltip-text="placeholderText"
      />
    </div>
    <div class="flex flex-row items-center">
      <p class="mr-4">
        {{ projectBasePath }}
      </p>
      <input
        id="slug"
        v-model="slug"
        name="slug"
        type="text"
        :disabled="isDisabled"
        class="w-full border border-cloud rounded-md dark:(bg-pitch text-fog placeholder:text-insight) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
        required
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = withDefaults(defineProps<{
  existingSlug?: string
  isDisabled?: boolean
}>(), {
  existingSlug: '',
  isDisabled: false
})

const emit = defineEmits<{(e: 'emitUpdatedSlug', slug: string): void}>()
const placeholderText = 'Enter a unique URL for your project using dash.'
const projectBasePath = 'https://arbimon.rfcx.org/project/'
const slug = ref('')

const value: ComputedRef<string> = computed(() => {
  return slug.value
})

onMounted(() => {
  if (props.existingSlug) {
    slug.value = props.existingSlug
  }
})

watch(slug, () => {
  emit('emitUpdatedSlug', value.value)
})
</script>
