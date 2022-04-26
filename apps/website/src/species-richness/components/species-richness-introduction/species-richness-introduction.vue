<template>
  <page-title
    page-title="Species Richness"
    page-subtitle="Diversity of detected species"
    :topic="infoTopic"
  >
    <export-button
      :disabled="!props.hasData || loading"
      :loading="loading"
      :title="props.hasData ? '' : 'No data selected'"
      @click="exportCsvReports()"
    >
      <template #label>
        <div class="ml-2 <md:hidden">
          Download Source
        </div>
        <div class="ml-2 md:hidden">
          Source
        </div>
      </template>
    </export-button>
  </page-title>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { INFO_TOPICS } from '@/info/info-page'
import { downloadCsvReports } from '@/species-richness/csv'
import { richnessService } from '@/species-richness/services'
import { ColoredFilter, filterToDataset } from '~/filters'
import { useStore } from '~/store'

const DEFAULT_PREFIX = 'Species-Richness-Raw-Data'

const props = defineProps<{ filters: ColoredFilter[], hasData: boolean }>()

const store = useStore()
const infoTopic = INFO_TOPICS.richness
const loading = ref(false)

const exportCsvReports = async () => {
  loading.value = true
  const filters = props.filters
  const reports = (await Promise.all(
    filters.map(async (filter) => {
      return await richnessService.getRichnessExport(filterToDataset(filter))
    })
  )).filter(isDefined)
  await downloadCsvReports(filters, reports, DEFAULT_PREFIX, store.projectData.value.data?.taxonClasses ?? [])
  loading.value = false
}

</script>
