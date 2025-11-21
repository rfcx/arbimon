<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
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
        aria-expanded="false"
        aria-controls="accordion-collapse-body-templates"
        @click="toggleTemplateMenu()"
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
          <span class="ml-1">Templates (Pattern Matching Analysis)</span>
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
      class="hidden w-[90%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-templates"
    >
      <div class="flex flex-row justify-end gap-x-2">
        <button
          class="flex ml-2 items-center justify-center p-1 h-[20px] w-[32px] min-w-[32px] rounded-[6px] border-util-gray-01 bg-util-gray-03  cursor-pointer hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipSelectedTemplateId"
          data-tooltip-style="light"
          @click="toggleAddTemplate()"
        >
          <icon-custom-ic-plus-icon class="text-util-gray-01 h-4" />
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
        class="text-xs"
      >
        <li
          class="grid grid-cols-3 gap-x-6 text-white px-4 py-2 border-b-1 border-util-gray-03"
        >
          <span>Template</span>
          <span>X scale</span>
          <span>Y scale</span>
        </li>
        <li
          v-for="template in spectrogramTemplates"
          :key="'template-' + template.id"
          class="grid grid-cols-3 gap-x-6 text-white px-4 py-2 border-b-1 border-util-gray-03"
        >
          <div>
            <span>{{ template.name }}</span>
          </div>
          <span>{{ template.x1.toFixed(2) }} s - {{ template.x2.toFixed(2) }} s</span>
          <span>{{ (template.y1/1000).toFixed(2) }} kHz - {{ (template.y2/1000).toFixed(2) }} kHz</span>
        </li>
      </ul>
      <span v-else>There are no templates in this recording.</span>
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
  visobject: Visobject
}>()

const emits = defineEmits<{(e: 'emitTemplateVisibility', value: boolean): void, (e: 'emitActiveLayer', isActive: boolean): void}>()

const spectrogramTemplates = ref<TemplateResponse[]>([])

const store = useStore()
const route = useRoute()
const toggledTemplateMenu = ref<boolean>(false)
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

const toggleAddTemplate = () => {
  emits('emitActiveLayer', true)
}

const toggleTemplateMenu = () => {
  toggledTemplateMenu.value = !toggledTemplateMenu.value
  if (toggledTemplateMenu.value === false) emits('emitActiveLayer', false)
}

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
