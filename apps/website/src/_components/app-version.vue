<template>
  <p>
    RFCx Biodiversity Reports ({{ releaseMode }}<span v-if="releaseCommit">-{{ releaseCommit }}</span>)<br>
    {{ formatDateFull(releaseDate) }}
  </p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import useDateFormat from '../_services/hooks/use-date-format'

const { formatDateFull } = useDateFormat()

const releaseMode = ref(import.meta.env.MODE)
const releaseCommit = ref(import.meta.env.VITE_RELEASE_COMMIT)
const releaseDateRaw = Number(import.meta.env.VITE_RELEASE_DATE)
const releaseDate = ref(releaseDateRaw > 0 ? new Date(releaseDateRaw * 1000) : new Date())

</script>
