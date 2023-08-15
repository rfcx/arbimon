<template>
  <div class="job-detail-header-wrapper flex justify-between">
    <el-breadcrumb
      class="job-detail-breadcrumb"
      separator="/"
    >
      <el-breadcrumb-item :to="{ name: ROUTE_NAMES.cnnJobList }">
        CNN Jobs
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <span class="text-subtle">{{ jobId }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="job-btn-container">
      <el-button
        type="info"
        size="large"
        class="rounded-md uppercase font-medium"
      >
        <icon-fa-pause class="h-4 w-4 mr-2" /> Pause
      </el-button>
      <el-button
        type="info"
        size="large"
        class="uppercase font-medium text-sm text-flamingo rounded-md"
      >
        Cancel job
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
const jobId = computed(() => route.params.jobId)
</script>
