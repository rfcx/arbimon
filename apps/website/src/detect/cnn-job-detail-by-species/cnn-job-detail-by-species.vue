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
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

const route = useRoute()

const jobId = computed(() => route.params.jobId)
// TODO: Get species name from species slug
const speciesName = computed(() => route.params.speciesSlug)
</script>
