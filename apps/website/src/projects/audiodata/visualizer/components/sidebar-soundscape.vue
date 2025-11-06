<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div id="accordion-collapse-heading-soundscape">
      <button
        type="button"
        class="flex justify-between items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-soundscape"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-soundscape"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1">Soundscape Composition</span>
        </div>
      </button>
    </div>
    <div
      id="accordion-collapse-body-soundscape"
      class="hidden flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-soundscape"
    >
      <div
        v-for="(group, groupName) in soundscape"
        :key="groupName"
        class="mb-4"
      >
        <h4 class="font-bold text-sm mb-1">
          {{ groupName }}
        </h4>
        <div
          v-for="item in group"
          :key="item.name"
          class="flex items-center justify-between px-ๅ py-1 rounded"
        >
          <span>{{ item.name }}</span>

          <div class="flex items-center">
            <button
              class="flex items-center justify-center h-[24px] w-[24px] py-[1px] px-[6px] rounded-l bg-util-gray-04 hover:bg-echo"
              title="Annotate as Present"
              @click="onPresent(item)"
            >
              <icon-fa-check class="text-[#7fa2ec] w-4 h-4" />
            </button>

            <button
              class="flex items-center justify-center h-[24px] w-[24px] py-[2px] px-[7px] rounded-r bg-util-gray-04 hover:bg-echo"
              title="Annotate as Absent"
              @click="onAbsent(item)"
            >
              <icon-fa-times class="text-[#ffe680] w-4 h-4" />
            </button>

            <button
              class="flex items-center justify-center h-[24px] w-[24px] py-[2px] px-[7px] rounded bg-util-gray-04 hover:bg-echo ml-2"
              title="Clear Annotation"
              @click="clearAnnotation(item)"
            >
              <icon-fa-minus class="text-[#7F7D78] w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SoundscapeResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

const props = defineProps<{
  visobject: Visobject
  soundscapeResponse?: SoundscapeResponse[]
}>()

export interface SoundItem {
  id: number
  name: string
  system: number
  typeId: number
  type: string
}

type Soundscape = Record<string, SoundItem[]>

function transformSoundscapeResponse (data: SoundItem[]): Soundscape {
  return data.reduce<Soundscape>((acc, item) => {
    const typeKey = String(item.type)
    if (!(typeKey in acc)) {
      acc[typeKey] = []
    }
    acc[typeKey].push({
      id: item.id,
      name: item.name,
      system: item.system,
      typeId: item.typeId,
      type: item.type
    })
    return acc
  }, {})
}

const soundscape = computed(() => transformSoundscapeResponse(props.soundscapeResponse ?? []))
const emit = defineEmits<{(e: 'action', action: 'present' | 'absent' | 'clearAnnotation', item: SoundItem): void}>()
function onPresent (item: SoundItem) {
  emit('action', 'present', item)
}

function onAbsent (item: SoundItem) {
  emit('action', 'absent', item)
}

function clearAnnotation (item: SoundItem) {
  emit('action', 'clearAnnotation', item)
}
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
