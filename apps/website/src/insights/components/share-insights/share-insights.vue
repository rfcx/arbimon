<template>
  <ShareInsightsInformation
    :is-open="modelValue === 'share-insights-information'"
    @emit-close-modal="closeModal"
    @emit-share-insight-successful="onEmitShareInsightsSuccessful"
  />
  <ShareInsightsSuccessful
    :is-open="modelValue === 'share-insights-successful'"
    @emit-close-modal="closeModal"
    @emit-hide-insights="hideInsights"
  />
  <HideInsightsToNonProjectMembersConfirmation
    :is-open="modelValue === 'hide-insights-confirmation'"
    @emit-close-modal="closeModal"
    @emit-hide-insights-confirm="hideInsightsConfirm"
  />
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject } from 'vue'

import { apiClientKey } from '@/globals'
import { useUpdateInsightsPublishStatus } from '@/insights/_composables/use-update-insights-publish-status'
import { useStore } from '~/store'
import HideInsightsToNonProjectMembersConfirmation from './hide-insights-to-non-project-members-confirmation.vue'
import ShareInsightsInformation from './share-insights-information.vue'
import ShareInsightsSuccessful from './share-insights-successful.vue'
import type { InsightsPublishStatus } from './types'

const store = useStore()

defineProps<{ modelValue: InsightsPublishStatus }>()
const emit = defineEmits<{(event: 'update:modelValue', value: InsightsPublishStatus): void, (event: 'emit-share-insights-successful'): void, (event: 'emit-hide-insights-successful'): void}>()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => store.project?.id)
const { mutate: mutateInsightsPublishStatus } = useUpdateInsightsPublishStatus(apiClientBio, selectedProjectId)

const closeModal = (): void => {
  emit('update:modelValue', 'idle')
}

const onEmitShareInsightsSuccessful = (): void => {
  emit('update:modelValue', 'share-insights-successful')
  emit('emit-share-insights-successful')
}

const hideInsights = (): void => {
  emit('update:modelValue', 'hide-insights-confirmation')
}

const hideInsightsConfirm = (): void => {
  mutateInsightsPublishStatus(false, {
    onSuccess: () => {
      emit('update:modelValue', 'idle')
      emit('emit-hide-insights-successful')
    },
    onError: () => {
      // TODO: Show some errors.
      emit('update:modelValue', 'idle')
    }
  })
}
</script>
