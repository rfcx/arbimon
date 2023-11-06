<template>
  <div
    v-if="!isEditing"
    class="inline-flex"
    :class="canEdit ? 'cursor-pointer' : ''"
    @mouseover="isHovering = canEdit"
    @mouseleave="isHovering = false"
    @click="enterEditingMode"
  >
    <h6
      class="text-insight pb-4 min-h-10"
    >
      {{ text }}
    </h6>
    <button class="w-2 h-2 ml-2">
      <icon-custom-fi-edit
        v-if="isHovering && !isEditing && canEdit"
        @click="isEditing = true"
      />
    </button>
  </div>
  <div
    v-else
    class="flex flex-col lg:flex-row gap-2 items-start"
  >
    <textarea
      v-model.lazy.trim="text"
      :placeholder="PLACEHOLDER_TEXT"
      class="select-auto selection:bg-fog text-pitch rounded-md p-1 h-20 border-util-gray-03"
    />
    <div class="flex gap-2">
      <button
        class="btn btn-primary py-1 flex-0 inline-flex items-center"
        @click="save"
      >
        Save
      </button>
      <button
        class="btn btn-secondary py-1 flex-0"
        @click="exitEdittingMode"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useDashboardStore, useStore } from '~/store'
import { useUpdateProjectProfile } from '../../../projects/_composables/use-project-profile'

const PLACEHOLDER_TEXT = 'One line summary about the project. Some context such as timeline, goals. Some context such as timeline, goals.'

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const store = useStore()
const dashboardStore = useDashboardStore()

const { mutate: mutateProjectProfile } = useUpdateProjectProfile(apiClientBio, store.selectedProject?.id ?? -1)

const props = defineProps<{
  defaultText: string
  canEdit: boolean
}>()

const isEditing = ref(false)
const isHovering = ref(false)

const text = ref(props.defaultText)

watch(() => props.defaultText, (newVal) => {
  text.value = newVal
})

const enterEditingMode = () => {
  if (!props.canEdit) { return }
  isEditing.value = true
  isHovering.value = false
}

const exitEdittingMode = () => {
  isEditing.value = false
  isHovering.value = false
}

const save = () => {
  mutateProjectProfile({ summary: text.value }, {
    onSuccess: (res) => {
      if (res?.summary) {
        dashboardStore.updateProjectSummary(res?.summary)
      }
      exitEdittingMode()
    },
    onError: () => {
      // TODO: show error message
    }
  })
}

</script>
