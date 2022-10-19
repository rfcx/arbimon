<template>
  <input
    v-model.number="currentValue"
    type="number"
    :min="props.minValue"
    :max="props.maxValue"
    class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
    @change="onValueChange(currentValue)"
  >
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  defaultValue: number
  minValue: number,
  maxValue: number
}>(), {
  defaultValue: 1,
  minValue: 0,
  maxValue: 99
})

const emit = defineEmits<{(e: 'emitValueChange', configChange: number): void }>()
const currentValue = ref(0)

onMounted(() => {
  currentValue.value = props.defaultValue
})

watch(() => props.defaultValue, () => {
  currentValue.value = props.defaultValue
}, { deep: true })

const onValueChange = (value: number) => {
  emit('emitValueChange', value)
}

</script>
