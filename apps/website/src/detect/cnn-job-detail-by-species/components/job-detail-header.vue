<template>
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
        <span class="text-subtle">{{ speciesSlug }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
const speciesSlug = computed(() => typeof route.params.speciesSlug === 'string' ? route.params.speciesSlug : '')
</script>
