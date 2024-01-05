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

<!-- <style lang="scss">
[type='checkbox']:checked{
  color: #adff2c !important;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e") !important
}

.el-input.is-disabled .el-input__wrapper {
  background-color: transparent;
  opacity: 0.4;
}

.el-input__wrapper {
  border-radius: 5px;
  border: 0px;
}

.el-input {
  .el-input__wrapper {
    background-color: transparent;
    height: var(--el-component-size-large);
  }
}

.el-icon {
  color: #6B7280;
}

</style> -->
