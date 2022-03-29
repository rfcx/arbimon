<template>
  <p class="text-center text-xs text-box-grey">
    RFCx Biodiversity Reports <br>
    Build: <span class="font-mono">{{ releaseCommit }}</span> - {{ formatDateFull(releaseDate) }}
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

// Convert unix seconds to DayJs
const releaseDateRaw = Number(import.meta.env.VITE_RELEASE_DATE)
const releaseDateDayJs = Number.isNaN(releaseDateRaw) ? new Date(releaseDateRaw * 1000) : Date()

// Export refs
const releaseDate = ref(releaseDateDayJs)
const releaseCommit = ref(import.meta.env.VITE_RELEASE_COMMIT)

// Export formatters
const { formatDateFull } = useDateFormat()
</script>
