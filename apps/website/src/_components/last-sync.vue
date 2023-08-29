<template>
  <p v-if="props.syncUpdated === null">
    This project has been queued for detection data synchronization
  </p>
  <p v-else>
    Last generated based on validated Arbimon data at:<br>
    {{ formatDateFull(props.syncUpdated) }}
    <span v-if="isProjectMember">
      ・ <router-link
        :to="syncHistoryRoute"
        class="inline hover:(underline text-insight cursor-pointer)"
      >
        Sync History
      </router-link>
    </span>
  </p>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { storeKey } from '@/globals'
import useDateFormat from '../_services/hooks/use-date-format'
import type { BiodiversityStore } from '../_services/store'

const props = defineProps<{syncUpdated: Date | string | null, projectSlug: string}>()

const { formatDateFull } = useDateFormat()
const store = inject(storeKey) as BiodiversityStore

const syncHistoryRoute = computed(() => ({
  name: 'sync_history',
  params: { projectSlug: props.projectSlug }
}))

const isProjectMember = computed(() => store?.selectedProject?.isMyProject)

</script>
