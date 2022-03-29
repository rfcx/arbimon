<template>
  <p
    v-if="props.syncUpdated === null"
    class="text-xs text-left py-2 mt-5 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50"
  >
    This project has been queued for detection data synchronization
  </p>
  <p
    v-else
    class="text-xs text-left py-2 mt-5 border-t-1 border-l-0 border-r-0 border-b-0 border-solid opacity-50"
  >
    Last generated based on validated analysis data from Arbimon at: {{ formatDateFull(props.syncUpdated) }}
    <span
      v-if="isProjectMember"
      class="text-subtle inline"
    >
      ・ <router-link
        :to="syncHistoryRoute"
        class="hover:(underline text-white cursor-pointer)"
      >
        Sync History
      </router-link>
    </span>
  </p>
</template>

<script lang="ts" setup>
import { computed, defineProps, inject } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'
import { BiodiversityStore } from '../_services/store'

const props = defineProps<{syncUpdated: Date | string | null, projectSlug: string}>()

const { formatDateFull } = useDateFormat()
const store = inject<BiodiversityStore>('store')

const syncHistoryRoute = computed(() => ({
  name: 'sync_history',
  params: { projectSlug: props.projectSlug }
}))

const isProjectMember = computed(() => store?.selectedProject?.isMyProject)

</script>
