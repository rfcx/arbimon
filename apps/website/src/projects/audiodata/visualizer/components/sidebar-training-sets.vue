<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div
      id="accordion-collapse-heading-training"
      data-accordion="open"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-training"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-training"
        @click="toggleTrainingSetMenu()"
      >
        <div class="flex flex-row items-center gap-x-1">
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span>Training Sets (RF Algorithm)</span>
        </div>
      </button>
      <div
        @click="toggleTrainingSetVisible()"
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
      id="accordion-collapse-body-training"
      class="hidden w-[90%] flex flex-col gap-y-2"
      aria-labelledby="accordion-collapse-heading-training"
    >
      <div class="flex flex-row justify-between items-center">
        <BasicSearchSelect
          v-model="selectedTrainingSetValue"
          class="w-full"
          :options="options"
          :w-full="true"
          placeholder="Select a training set"
        />
        <button
          class="flex ml-2 items-center justify-center p-1 h-[34px] w-[34px] min-w-[34px] rounded-[4px] bg-util-gray-03 hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipTrainingSetsId"
          data-tooltip-style="light"
          @click="toggleCreateTrainingSet()"
        >
          <icon-custom-ic-plus-icon class="text-frequency h-4" />
        </button>
        <div
          id="tooltipTrainingSetsId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Create a new training set
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <SidebarTrainingSetModal
          :visible="toggledCreateTrainingSet"
          @emit-training-set-data="handleNewTrainingSet"
          @cancel="toggledCreateTrainingSet = false"
        />
      </div>
    </div>

    <div
      v-show="toggledTrainingSetMenu && selectedTrainingSetText !== ''"
      :id="'accordion-collapse-heading-training-sets-' + selectedTrainingSetText"
      class="w-[90%] flex flex-row justify-between items-center"
    >
      <button
        type="button"
        class="flex flex-row justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        :data-accordion-target="'#accordion-collapse-body-training-sets-' + selectedTrainingSetText"
        aria-expanded="false"
        :aria-controls="'accordion-collapse-body-training-sets-' + selectedTrainingSetText"
        @click="toggleTrainingSet = !toggleTrainingSet"
      >
        <div class="flex flex-row items-center">
          <icon-fa-chevron-down
            v-if="toggleTrainingSet === true"
            class="w-3 h-3 fa-chevron-up"
          />
          <icon-fa-chevron-right
            v-if="toggleTrainingSet === false"
            class="w-3 h-3 fa-chevron-right"
          />
          <span class="ml-1">{{ selectedTrainingSetText }}</span>
        </div>
      </button>
      <div class="flex flex-row justify-center gap-x-2">
        <button
          class="flex ml-2 items-center justify-center p-1 h-[20px] w-[32px] min-w-[32px] rounded-[6px] border-util-gray-01 bg-util-gray-03  cursor-pointer hover:bg-util-gray-04 transition"
          data-tooltip-target="tooltipSelectedTrainingSetId"
          data-tooltip-style="light"
          @click="toggleAddTsRoiBox()"
        >
          <icon-custom-ic-plus-icon class="text-util-gray-01 h-4" />
        </button>
        <div
          id="tooltipSelectedTrainingSetId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Add {{ selectedTrainingSetText }} ROI to the recording
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <div
          class="min-w-5 flex flex-row justify-center cursor-default items-center gap-x-1 bg-[#D9D9D9] text-pitch rounded-full text-xs px-2 py-0.6"
          data-tooltip-target="tooltipSelectedTrainingSetCountId"
          data-tooltip-style="light"
        >
          {{ recordingTrainingSets?.length ?? 0 }}
        </div>
        <div
          id="tooltipSelectedTrainingSetCountId"
          role="tooltip"
          class="absolute z-200 invisible inline-block px-3 py-2 text-sm font-medium text-insight transition-opacity duration-300 bg-util-gray-03 rounded-lg shadow-sm opacity-0 tooltip"
        >
          Count of {{ selectedTrainingSetText }} training set ROI boxes
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
    </div>
    <div
      v-if="toggleTrainingSet"
      :id="'accordion-collapse-body-training-sets-' + selectedTrainingSetText"
      class="w-[90%] flex flex-col gap-y-2 text-sm font-medium"
      :aria-labelledby="'accordion-collapse-heading-training-sets-' + selectedTrainingSetText"
    >
      <ul
        v-if="selectedTrainingSet !== undefined && recordingTrainingSets?.length"
        class="text-xs"
      >
        <li
          class="grid grid-cols-4 gap-x-6 text-white px-4 py-2 border-b-1 border-util-gray-03"
        >
          <span>x1</span>
          <span>y1</span>
          <span>x2</span>
          <span>y2</span>
        </li>
        <li
          v-for="set in recordingTrainingSets"
          :key="'set-' + set.id"
          class="grid grid-cols-4 gap-x-6 text-white px-4 py-2 border-b-1 border-util-gray-03"
        >
          <span>{{ set.x1.toFixed(2) }} s</span>
          <span>{{ (set.y1/1000).toFixed(2) }} kHz</span>
          <span>{{ set.x2.toFixed(2) }} s</span>
          <span>{{ (set.y2/1000).toFixed(2) }} kHz</span>
        </li>
      </ul>
      <span v-else>There is no training data in this recording.</span>
    </div>
    <alert-dialog
      v-if="showAlert"
      :severity="success"
      :title="title"
      :message="message"
    />
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { initAccordions, initDropdowns, initTooltips } from 'flowbite'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { RecordingTrainingSetParams, TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import type { AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetRecordingTrainingSets, useGetTrainingSets, usePostNewTrainingSet } from '../../_composables/use-training-sets'
import BasicSearchSelect from './basic-search-select.vue'
import SidebarTrainingSetModal from './sidebar-training-set-modal.vue'

const emits = defineEmits<{(e: 'emitTrainingSet', value: TrainingSet): void,
  (e: 'emitActiveLayer', isActive: boolean, type: string): void,
  (e: 'emitTrainingSetVisibility', value: boolean): void
}>()

const toggledTrainingSetMenu = ref<boolean>(false)
const toggleTrainingSet = ref<boolean>(false)
const selectedTrainingSet = ref<TrainingSet>()
const selectedTrainingSetText = ref<string>('')
// TODO: When click on ic-eye to hander hied/show TrainingSets box on spectrogram
const toggleVisible = ref<boolean>(true)
const toggledCreateTrainingSet = ref<boolean>(false)
const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)

const selectedTrainingSetValue = ref<string | number | undefined>(undefined)
const route = useRoute()
const store = useStore()
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const selectedProjectSlug = computed(() => store.project?.slug)

const recordingTrainingSetParams = computed<RecordingTrainingSetParams>(() => {
  return {
    recordingId: browserTypeId.value,
    trainingSetId: selectedTrainingSet.value ? selectedTrainingSet.value.id : ''
  }
})
const { data: recordingTrainingSets } = useGetRecordingTrainingSets(apiClientArbimon, selectedProjectSlug, recordingTrainingSetParams)
const { data: trainingSets, refetch: refetchTrainingSets } = useGetTrainingSets(apiClientArbimon, selectedProjectSlug)
const { mutate: mutateNewTrainingSet } = usePostNewTrainingSet(apiClientArbimon, selectedProjectSlug)

const options = computed(() => trainingSets.value?.map(t => ({ label: t.name, value: t.id })) ?? [])

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

const handleNewTrainingSet = (name: string, classId: number) => {
  toggledCreateTrainingSet.value = false
  mutateNewTrainingSet({
    type: 'roi_set',
    name,
    class: classId
  }, {
    onSuccess: async (data: any) => {
      if (data.error === 'Training set name in use') {
        showAlertDialog('success', 'Success', 'Training set name in use')
        return
      }
      await refetchTrainingSets()
      showAlertDialog('success', 'Success', 'Training set added')
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error adding training set')
    }
  })
}

const toggleCreateTrainingSet = () => {
  toggledCreateTrainingSet.value = !toggledCreateTrainingSet.value
  emits('emitActiveLayer', true, 'New Training Set')
}

const toggleAddTsRoiBox = () => {
  emits('emitActiveLayer', true, 'Training Set ROI Box')
}

const toggleTrainingSetMenu = () => {
  toggledTrainingSetMenu.value = !toggledTrainingSetMenu.value
  if (toggledTrainingSetMenu.value === false) emits('emitActiveLayer', false, '')
}

const toggleTrainingSetVisible = () => {
  toggleVisible.value = !toggleVisible.value
  emits('emitTrainingSetVisibility', toggleVisible.value)
}

watch(() => selectedTrainingSetValue.value, (ts) => {
  if (ts === undefined) return
  nextTick()
  initAccordions()
  selectedTrainingSet.value = trainingSets.value?.find(t => t.id === ts)
  selectedTrainingSetText.value = selectedTrainingSet.value?.species_name ?? ''
  if (selectedTrainingSet.value) emits('emitTrainingSet', selectedTrainingSet.value)
})

onMounted(async () => {
  await nextTick()
  initAccordions()
  initDropdowns()
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
