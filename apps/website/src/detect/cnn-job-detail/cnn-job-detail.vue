<template>
  <job-detail-header />
  <job-detail-information class="mt-4" />
  <job-detail-result class="mt-4" />
  <job-detections class="mt-4" />
</template>
<script setup lang="ts">
import JobDetailHeader from './components/job-detail-header.vue'
import JobDetections from './components/job-detections.vue'
import JobDetailInformation from './components/job-information.vue'
import JobDetailResult from './components/job-result.vue'

</script>
