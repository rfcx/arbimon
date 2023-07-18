<template>
  <div>
    <div class="job-detail-by-species-header-wrapper flex justify-between">
      <el-breadcrumb
        class="job-detail-breadcrumb"
        separator="/"
      >
        <el-breadcrumb-item :to="{ name: ROUTE_NAMES.cnnJobList }">
          CNN Jobs
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId } }">
          <span class="text-subtle">{{ jobId }}</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="text-subtle">{{ speciesName }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="job-btn-container">
        <el-button
          type="info"
          size="large"
          class="rounded-md uppercase font-semibold"
        >
          JOB DETAIL
        </el-button>
        <el-button
          type="info"
          size="large"
          class="rounded-md"
        >
          <icon-fa-ellipsis-h />
        </el-button>
      </div>
    </div>
    <div class="job-detail-by-species-selector mt-4">
      <section-title>
        <template #title>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">
              Name of the species (amount of detections)
            </h2>
          </div>
        </template>
        <template #controls>
          <JobResultFilterBySpecies />
        </template>
      </section-title>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import JobResultFilterBySpecies from './components/job-result-filter-by-species.vue'

const route = useRoute()

const jobId = computed(() => route.params.jobId)
// TODO: Get species name from species slug
const speciesName = computed(() => route.params.speciesSlug)
</script>
