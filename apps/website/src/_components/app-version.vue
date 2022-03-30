<template>
  <p>
    RFCx Biodiversity Reports (version <span class="font-mono">{{ releaseCommit }}</span>)
    <span v-if="releaseDate"><br>{{ formatDateFull(releaseDate) }}</span>
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

// Convert unix seconds to DayJs
const releaseDateRaw = Number(import.meta.env.VITE_RELEASE_DATE)

// Export refs
const releaseDate = ref(Number.isNaN(releaseDateRaw) ? new Date(releaseDateRaw * 1000) : undefined)
const releaseCommit = ref(import.meta.env.VITE_RELEASE_COMMIT)

// Export formatters
const { formatDateFull } = useDateFormat()
</script>
