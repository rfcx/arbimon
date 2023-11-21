<template>
  <div
    class="inline-flex"
  >
    <h6
      class="text-insight pb-4 min-h-10"
    >
      {{ text }}
    </h6>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  defaultText: string
}>()

const text = ref(props.defaultText)

watch(() => props.defaultText, (newVal) => {
  text.value = newVal
})

</script>
