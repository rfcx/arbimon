<template>
  <div class="inline-flex items-center gap-2">
    <span
      v-if="label"
      class="text-xs font-bold text-white"
    >{{ label }}</span>
    <div class="inline-flex border border-util-gray-03 rounded overflow-hidden">
      <button
        v-for="option in options"
        :key="option"
        :class="[
          'px-[10px] py-[5px] text-xs border-l font-bold border-util-gray-03 first:border-l-0',
          modelValue === option
            ? 'bg-util-gray-03 text-white'
            : 'hover:bg-util-gray-04 text-white',
        ]"
        @click="select(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  options?: number[]
  label?: string
}>(), {
  options: () => [10, 25, 50, 100],
  label: ''
})

const emit = defineEmits<{(e: 'update:modelValue', value: number): void }>()

const select = (value: number): void => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>
