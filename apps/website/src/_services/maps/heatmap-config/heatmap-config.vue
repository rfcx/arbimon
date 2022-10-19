<template>
  <div>
    <label>{{ props.label }}:</label>
    <heatmap-config-input
      :default-value="currentConfig[0]"
      :min-value="0"
      :max-value="16"
      @emit-value-change="value => onConfigChange(0, value)"
    />
    <heatmap-config-input
      :default-value="currentConfig[1]"
      :min-value="props.minValue"
      :max-value="props.maxValue"
      @emit-value-change="value => onConfigChange(1, value)"
    />
    :
    <heatmap-config-input
      :default-value="currentConfig[2]"
      :min-value="0"
      :max-value="16"
      @emit-value-change="value => onConfigChange(2, value)"
    />
    <heatmap-config-input
      :default-value="currentConfig[3]"
      :min-value="props.minValue"
      :max-value="props.maxValue"
      @emit-value-change="value => onConfigChange(3, value)"
    />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import { HeatmapCustomByZoom } from '../utils/heatmap-style/style-to-paint'
import HeatmapConfigInput from './config-input.vue'

const props = withDefaults(defineProps<{
  label: string,
  defaultConfig: HeatmapCustomByZoom,
  minValue: number,
  maxValue: number
}>(), {
  label: 'weight',
  minValue: 0,
  maxValue: 99
})

const emit = defineEmits<{(e: 'emitConfigChange', configChange: HeatmapCustomByZoom): void }>()
const currentConfig = ref<HeatmapCustomByZoom>([0, 0, 1, 2])

onMounted(() => {
  currentConfig.value = props.defaultConfig
})

watch(() => props.defaultConfig, () => {
  currentConfig.value = props.defaultConfig
}, { deep: true })

const onConfigChange = (idx: number, value: number) => {
  currentConfig.value[idx] = value
  emit('emitConfigChange', currentConfig.value)
}

</script>
