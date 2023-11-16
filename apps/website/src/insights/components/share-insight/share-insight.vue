<template>
  <ShareInsightInformation
    :is-open="steps === 1"
    @emit-close-modal="closeModal"
    @emit-share-insight-successful="onEmitShareInsightSuccessful"
  />
  <ShareInsightSuccessful
    :is-open="steps === 2"
    @emit-close-modal="closeModal"
    @emit-hide-insight="hideInsight"
  />
  <HideInsightToNonProjectMembersConfirmation
    :is-open="steps === 3"
    @emit-close-modal="closeModal"
    @emit-hide-insight-confirm="hideInsightConfirm"
  />
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'

import { apiClientBioKey } from '@/globals'
import { useUpdateInsightsPublishStatus } from '@/insights/_composables/use-update-insights-publish-status'
import { useStore } from '~/store'
import HideInsightToNonProjectMembersConfirmation from './hide-insight-to-non-project-members-confirmation.vue'
import ShareInsightInformation from './share-insight-information.vue'
import ShareInsightSuccessful from './share-insight-successful.vue'

const store = useStore()

const props = defineProps<{ modelValue: 'start-show' | 'start-hide' | 'default-show' | 'idle' }>()
const emit = defineEmits<{(event: 'update:modelValue', value: 'start-show' | 'start-hide'| 'default-show' | 'idle'): void, (event: 'emit-share-insight-successful'): void, (event: 'emit-hide-insight-successful'): void}>()

const steps = ref<0 | 1 | 2 | 3>(0)

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const selectedProjectId = computed(() => store.selectedProject?.id)
const { mutate: mutateInsightsPublishStatus } = useUpdateInsightsPublishStatus(apiClientBio, selectedProjectId)

watch(() => props.modelValue, (newValue) => {
  if (newValue === 'start-show') {
    steps.value = 1
  }

  if (newValue === 'default-show') {
    steps.value = 2
  }

  if (newValue === 'start-hide') {
    steps.value = 3
  }
})

const closeModal = (): void => {
  steps.value = 0
  emit('update:modelValue', 'idle')
}

const onEmitShareInsightSuccessful = (): void => {
  steps.value = 2
  emit('emit-share-insight-successful')
}

const hideInsight = (): void => {
  steps.value = 3
}

const hideInsightConfirm = (): void => {
  mutateInsightsPublishStatus(false, {
    onSuccess: () => {
      steps.value = 0
      emit('update:modelValue', 'idle')
      emit('emit-hide-insight-successful')
    },
    onError: () => {
      // TODO: Show some errors.
      steps.value = 0
      emit('update:modelValue', 'idle')
    }
  })
}
</script>
