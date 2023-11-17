<template>
  <div class="flex items-center border border-insight rounded-lg space-x-3 justify-between py-4 px-[18px]">
    <div class="flex items-center justify-start space-x-2">
      <img
        class="w-12 h-12 rounded-full shadow"
        :src="image ?? undefined"
        alt="user profile image"
      >
      <div>
        <h3 class="text-base font-normal font-sans">
          {{ name }}
        </h3>
        <h4
          v-if="description"
          class="text-insight text-sm font-normal font-sans leading-tight"
        >
          {{ description }}
        </h4>
      </div>
    </div>
    <div class="ml-3 flex justify-center items-center">
      <input
        v-model="checked"
        class="appearance-none border-2 border-insight rounded-full bg-transparent checked:text-frequency ring-0 focus:ring-0 checked:border-0"
        type="checkbox"
        :value="id"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ id: number, name: string, description?: string, image: string | null, modelValue: number[] }>()
const emit = defineEmits<{(event: 'update:modelValue', value: number[]): void}>()

const checked = computed<number[]>({
  get () {
    return props.modelValue
  },
  set (newValue) {
    emit('update:modelValue', newValue)
  }
})
</script>
