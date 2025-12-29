<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow text-sm font-medium"
  >
    <div
      id="accordion-collapse-heading-templates"
      data-accordion="open"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-templates"
        :aria-expanded="isOpen"
        aria-controls="accordion-collapse-body-templates"
        @click="isOpen = !isOpen"
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
          <span class="ml-1 text-sm font-semibold">Templates (Pattern Matching Analysis)</span>
        </div>
      </button>
      <div
        class="cursor-pointer"
        @click="toggleTemplatesVisible()"
      >
        <icon-fa-eye
          v-if="toggleVisible"
          class="h-4 w-4"
        />
        <icon-fa-eye-slash
          v-else
          class="h-4 w-4 text-util-gray-02"
        />
      </div>
    </div>
    <div
      id="accordion-collapse-body-templates"
      class="hidden flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-templates"
    >
      <div class="flex flex-row gap-x-2 justify-between">
        <span
          :class="{
            'invisible': !(spectrogramTemplates === undefined || spectrogramTemplates?.length === 0)
          }"
        >There are no templates in this recording.</span>
        <button
          class="flex items-center justify-center p-1 h-7 w-7 min-w-7 rounded-[4px] border-util-gray-01 bg-util-gray-03  cursor-pointer hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipSelectedTemplateId"
          data-tooltip-style="light"
          @click="toggleTemplate"
        >
          <icon-custom-ic-plus-icon class="h-4 text-frequency" />
        </button>
        <div
          id="tooltipSelectedTemplateId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Create new Template
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <ul
        v-if="spectrogramTemplates !== undefined && spectrogramTemplates?.length"
        class="text-sm"
      >
        <li
          v-for="template in spectrogramTemplates"
          :key="'template-' + template.id"
        >
          <div class="border-t-1 border-util-gray-03 p-[5px]">
            <span class="flex">{{ template.name }}</span>
            <span class="flex">{{ template.species_name }} {{ template.songtype_name }}</span>
          </div>
          <div class="border-t-1 border-util-gray-03 p-[5px] grid grid-cols-2">
            <span>{{ template.x1.toFixed(2) }} s - {{ template.x2.toFixed(2) }} s</span>
            <span class="text-center">{{ (template.y1/1000).toFixed(2) }} kHz - {{ (template.y2/1000).toFixed(2) }} kHz</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initAccordions, initTooltips } from 'flowbite'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { type TemplateResponse, type Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetTemplates } from '../../_composables/use-visualizer'

const props = defineProps<{
  visobject: Visobject,
  currentTab: string
}>()

const emits = defineEmits<{(e: 'emitTemplateVisibility', value: boolean): void,
  (e: 'emitActiveLayer', isActive: boolean): void,
  (e: 'emitClosedTabs', value: string): void
}>()

const spectrogramTemplates = ref<TemplateResponse[]>([])

const store = useStore()
const route = useRoute()
const toggledTemplateMenu = ref<boolean>(false)
const isOpen = ref(false)
const selectedProjectSlug = computed(() => store.project?.slug)
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)

const { data: templates, refetch: refetchTemplates } = useGetTemplates(apiClientArbimon, selectedProjectSlug)

const toggleVisible = ref<boolean>(true)

const toggleTemplatesVisible = () => {
  toggleVisible.value = !toggleVisible.value
  emits('emitTemplateVisibility', toggleVisible.value)
}

const fetchRecordingTemplates = (): void => {
  spectrogramTemplates.value = templates.value?.filter((template: TemplateResponse) => {
    return template.recording === +browserTypeId.value
  }) ?? []
}

const toggleTemplate = () => {
  toggledTemplateMenu.value = !toggledTemplateMenu.value
  emits('emitActiveLayer', toggledTemplateMenu.value)
}

watch(() => isOpen.value, () => {
  if (isOpen.value === false) {
    toggledTemplateMenu.value = false
    emits('emitActiveLayer', toggledTemplateMenu.value)
  }
  if (isOpen.value === true) {
    emits('emitClosedTabs', 'template')
  }
})

watch(() => props.currentTab, () => {
  if (props.currentTab === 'template') return
  toggledTemplateMenu.value = false
  emits('emitActiveLayer', false)
})

watch(() => props.visobject, async () => {
  await refetchTemplates()
  fetchRecordingTemplates()
})

watch(() => templates.value, async () => {
  fetchRecordingTemplates()
  await nextTick()
  initAccordions()
  initTooltips()
})

onMounted(async () => {
  await nextTick()
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
