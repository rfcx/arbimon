<template>
  <div
    id="accordion-collapse-tag"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div id="accordion-collapse-heading-tag">
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight"
        data-accordion-target="#accordion-collapse-body-tag"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-tag"
      >
        <icon-fa-chevron-right
          data-accordion-icon
          class="w-3 h-3 text-insight fa-chevron-right"
        />
        <icon-fa-chevron-down
          data-accordion-icon
          class="w-3 h-3 fa-chevron-up text-insight hidden"
        />
        <span class="text-insight">Recording Tags</span>
      </button>
    </div>
    <div
      id="accordion-collapse-body-tag"
      class="hidden w-[90%] flex flex-col gap-y-2"
      aria-labelledby="accordion-collapse-heading-tag"
    >
      <div class="flex flex-row justify-between items-center">
        {{ visobject.file }}
        <button
          class="flex items-center justify-center p-1 w-7 h-7 rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipTagId"
          data-tooltip-style="light"
          @click="toggleTag"
        >
          <icon-custom-ic-plus-icon class="text-frequency h-4" />
        </button>
        <div
          id="tooltipTagId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Add new recording tag or annotate spectrogram
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Tag input -->
      <div
        v-if="toggledTag"
        class="flex items-start relative"
      >
        <SelectMultiple
          v-model="selectedTags"
          class="flex-1 min-w-0 placeholder-util-gray-02 border-1 rounded"
          :options="staticTags ?? []"
          placeholder="Add new tag or annotate spectrogram"
        />
        <icon-custom-ic-loading
          v-if="isAddingTag"
          class="animate-spin absolute -right-7 top-1.5"
          aria-label="Loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { initAccordions, initTooltips } from 'flowbite'
import { computed, onMounted, ref, watch } from 'vue'

import { type TagResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import type { RecordingTagResponse, TagParams, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type Option } from '../../component/select-multiple.vue'
import SelectMultiple from '../../component/select-multiple.vue'

const props = defineProps<{
  visobject: Visobject
  projectTags: TagResponse[] | undefined
  recordingTags: RecordingTagResponse[] | undefined
  isAddingTag: boolean
}>()

const emit = defineEmits<{(e: 'emitTag', tags: TagParams[]): void, (e: 'emitActiveLayer', value: boolean): void }>()

const toggledTag = ref(false)
const selectedTags = ref<(number)[]>(props.recordingTags?.map(t => t.tag_id) ?? [])
const staticTags = computed<Option[]>(() => {
  const projTags = (props.projectTags ?? []).map(t => ({
    value: t.tag_id,
    label: t.tag,
    tooltip: t.tag,
    icon: 'tag-icon',
    tagIcon: true
  }))
  if (props.recordingTags === undefined) return projTags
    projTags.filter(pt => props.recordingTags && !props.recordingTags.some(rt => rt.tag_id === pt.value))
  return projTags
})

const toggleTag = () => {
  toggledTag.value = !toggledTag.value
  emit('emitActiveLayer', toggledTag.value)
}

watch(() => selectedTags.value, () => {
  const tags: TagParams[] = selectedTags.value.map(recId => { return { id: recId } })
  return emit('emitTag', tags)
})

onMounted(() => {
  initAccordions()
  initTooltips()
})
</script>

<style lang="scss">

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-right {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-right {
  display: inline-block;
}

input::placeholder::-webkit-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
  font-size: 10px !important;
}
input::placeholder::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder::-ms-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
}
</style>
