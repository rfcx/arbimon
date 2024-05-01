<template>
  <div class="mt-6">
    <div class="flex flex-row">
      <label
        for="slug"
        class="block mb-2 font-medium text-gray-900 text-secondary"
      >Insight URL*</label>
      <icon-i-info
        tooltip-id="project-slug"
        :tooltip-text="placeholderText"
      />
    </div>
    <div class="flex flex-row items-center">
      <p class="mr-4 text-secondary">
        {{ projectBasePath }}
      </p>
      <input
        id="slug"
        v-model="slug"
        name="slug"
        type="text"
        :disabled="isDisabled"
        class="w-full border border-util-gray-03 rounded-md dark:(bg-pitch text-fog placeholder:text-placeholder) focus:(border-frequency ring-frequency) disabled:opacity-70 disabled:cursor-not-allowed"
        required
        :maxlength="PROJECT_SLUG_MAX_LENGTH"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'

import { PROJECT_SLUG_MAX_LENGTH } from '@rfcx-bio/utils/string/slug'

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
const projectBasePath = window.location.origin + '/p/'
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
