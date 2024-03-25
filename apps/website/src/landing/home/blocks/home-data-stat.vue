<template>
  <section class="bg-white dark:bg-pitch border-y-1 border-frequency bg-hero-data bg-cover bg-no-repeat bg-bottom-right">
    <div class="flex flex-col items-center justify-between lg:flex-row lg:py-10 px-4 py-20 gap-10 max-w-screen-xl mx-auto">
      <div class="text-center xl:w-52">
        <h3 class="text-2xl lg:text-xl font-medium font-header pb-2">
          Powered by data
        </h3>
        <p>Arbimon’s archive is continuously growing!</p>
      </div>
      <div class="grid grid-cols-2 gap-4 grid-flow-row lg:grid-cols-4">
        <number-stat
          :number="recordingsCount ? recordingsCount : 152889191"
          :loading="isLoadingRecordingsCount"
          title="Recordings uploaded"
        />
        <number-stat
          :number="jobsCount ? jobsCount : 1715129028"
          :loading="isLoadingJobsCount"
          title="Analyses performed"
        />
        <number-stat
          :number="projectsCount ? projectsCount : 4435"
          :loading="isLoadingProjectsCount"
          title="Projects created"
        />
        <number-stat
          :number="recordingsSpeciesCount ? recordingsSpeciesCount : 4088"
          :loading="isLoadingRecordingsSpeciesCount"
          title="Species identified"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { inject } from 'vue'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useJobsCount, useProjectsCount, useRecordingsCount, useRecordingsSpeciesCount } from '@/projects/_composables/use-landing-metrics-count'
import NumberStat from '../components/number-stat.vue'

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const { isLoading: isLoadingProjectsCount, data: projectsCount } = useProjectsCount(apiClientArbimon)
const { isLoading: isLoadingJobsCount, data: jobsCount } = useJobsCount(apiClientArbimon)
const { isLoading: isLoadingRecordingsCount, data: recordingsCount } = useRecordingsCount(apiClientArbimon)
const { isLoading: isLoadingRecordingsSpeciesCount, data: recordingsSpeciesCount } = useRecordingsSpeciesCount(apiClientArbimon)

</script>
