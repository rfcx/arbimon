<template>
  <div
    class="h-31 relative flex items-center border cursor-pointer py-4 px-[18px] rounded-lg justify-between"
    :class="checked ? 'border-frequency bg-moss' : 'border-insight hover:bg-moss'"
    @click="toggleCheckList"
  >
    <icon-custom-fi-check-circle
      v-if="checked"
      class="text-frequency bg-pitch w-6 h-6 absolute -translate-y-1/2 translate-x-1/2 left-auto -top-3 -right-3"
    />
    <div class="flex items-center justify-start space-x-3">
      <img
        v-if="image"
        class="w-12 h-12 rounded-full shadow"
        :src="image"
        @error="replaceByDefault"
      >
      <div
        v-else
        class="w-12 h-12 rounded-full shadow bg-util-gray-03"
      />
      <div class="ml-2">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ id: number, name: string, description?: string, image?: string, modelValue: number[] }>()
const emit = defineEmits<{(event: 'update:modelValue', value: number[]): void}>()

const checked = computed<boolean>(() => {
  return props.modelValue.includes(props.id)
})

const toggleCheckList = (): void => {
  if (checked.value) {
    const index = props.modelValue.findIndex(checkedId => checkedId === props.id)
    const copy = props.modelValue.slice(0)
    copy.splice(index, 1)

    emit('update:modelValue', [...copy])
  } else {
    emit('update:modelValue', [...props.modelValue, props.id])
  }
}

const replaceByDefault = (event: Event) => {
  (event.target as HTMLImageElement).src = new URL('@/_assets/default-stakeholder-image.png', import.meta.url).toString()
}
</script>
