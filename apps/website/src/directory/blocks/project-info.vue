<template>
  <div
    class="flex flex-col justify-between left-100 w-98 h-86vh bg-moss transition-transform -translate-x-full rounded-lg overflow-scroll"
  >
    <div class="flex flex-col">
      <div class="rounded-t-lg bg-moss">
        <div class="flex flex-row justify-between items-center">
          <div class="flex flex-1 flex-row items-center">
            <span
              class="text-spoonbill font-medium text-xs ml-4 my-3.5"
            >{{ getCountryLabel(project?.countries ?? [], 1) }}</span>
            <div
              v-if="countrieFlag"
              class="align-baseline flex"
            >
              <country-flag
                :country="countrieFlag"
                size="normal"
                class="flex ml-2"
              />
            </div>
            <icon-custom-fi-globe
              v-if="project?.countries ? project?.countries.length > 1 : false"
              class="flex m-2 my-3"
            />
          </div>
          <svg
            class="w-4 h-3.5 m-auto self-end mr-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            @click="emit('emitCloseProjectInfo')"
          >
            <path d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z" />
          </svg>
        </div>
      </div>
      <div class="overflow-scroll">
        <img
          v-if="project?.imageUrl"
          :src="project?.imageUrl"
          class="w-full object-contain bg-util-gray-03 h-52"
        >
        <div
          v-else
          class="w-full h-52 object-contain bg-util-gray-03 flex justify-center items-center"
        />
        <div class="p-4 border-b border-util-gray-03">
          <span class="text-lg font-medium">{{ project?.name }}</span>
          <div
            v-if="profile?.dateStart"
            class="flex font-medium text-sm flex-row border-util-gray-01 mt-3 space-x-2 items-center"
          >
            <span>
              Project dates:
            </span>
            <span>
              {{ formatDateRange(profile?.dateStart) }}
            </span>
            <icon-custom-arrow-right-white class="self-start" />
            <span>
              {{ formatDateRange(profile?.dateEnd) }}
            </span>
          </div>
          <router-link
            v-if="project?.isPublished"
            :to="`/p/${project?.slug}`"
            class="text-frequency"
          >
            <button
              class="btn btn-primary w-full mt-10"
              :disabled="project?.isMock"
              :class="{'opacity-50 cursor-not-allowed': !project?.isPublished}"
            >
              View project insights
            </button>
          </router-link>
        </div>
        <div class="p-4">
          <numeric-metric
            tooltip-id="deployment-sites"
            tooltip-text="Number of sites with recorders."
            title="Project sites:"
            :value="profile?.metrics?.totalSites ?? 0"
            icon-name="ft-map-pin-lg"
            class="flex-1"
          />
          <numeric-metric
            tooltip-id="threatened-species-over-all-species"
            title="Threatened / total species:"
            tooltip-text="Threatened, Vulnerable, Endangered, & Critically Endangered species over total species found."
            :value="profile?.metrics?.threatenedSpecies ?? 0"
            :total-value="profile?.metrics?.totalSpecies ?? 0"
            icon-name="ft-actual-bird"
            class="flex-1"
          />
          <numeric-metric
            tooltip-id="total-detections"
            title="Total detections:"
            tooltip-text="Total number of species calls detected."
            :value="profile?.metrics?.totalDetections ?? 0"
            icon-name="ft-search-lg"
            class="flex-1"
          />
          <numeric-metric
            tooltip-id="total-recordings"
            :tooltip-text="`Total minutes of recordings captured`"
            :title="`Total recordings (minutes):`"
            :value="totalRecordingsMin"
            icon-name="ft-mic-lg"
            class="flex-1"
          />
          <span
            v-if="project?.isMock"
            class="text-sm text-util-gray-01 px-2"
          >Only fake data. This project is not on dev environment. </span>
        </div>
        <div class="border-t-1 border-util-gray-03 px-4 mb-4">
          <h4 class="mt-4 font-medium mb-2">
            Taxonomic groups
          </h4>
          <p class="text-sm mb-2">
            Number of species detected in each taxonomic group.
          </p>
          <stack-distribution
            :dataset="speciesRichnessByTaxon"
            :known-total-count="`${profile?.metrics?.totalSpecies ?? 0}`"
            simple-no-data-text="This project has no species detection"
            class="my-4"
          />
        </div>
      </div>
    </div>
    <el-tabs
      v-model="activeTab"
      class="demo-tabs border-t-1 border-util-gray-03"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="About"
        name="about"
        class="m-4"
      >
        <p
          v-if="profile?.readme"
        >
          {{ profile?.readme }}
        </p>
        <p
          v-else
          class="text-sm p-4 rounded-lg border-1 border-util-gray-03 bg-util-gray-04"
        >
          Unfortunately, the project owner has not added content for this section.
        </p>
      </el-tab-pane>
      <el-tab-pane
        label="Key result"
        name="keyResult"
        class="m-4"
      >
        <p
          v-if="profile?.keyResult"
        >
          {{ profile?.keyResult }}
        </p>
        <p
          v-else
          class="text-sm p-4 rounded-lg border-1 border-util-gray-03 bg-util-gray-04"
        >
          Unfortunately, the project owner has not added content for this section.
        </p>
      </el-tab-pane>
      <el-tab-pane
        label="Stakeholders"
        name="stakeholders"
        class="m-4"
      >
        <div
          v-if="stakeholders?.organizations && !stakeholderError"
        >
          <h3 class="text-white text-xl font-medium font-sans mt-6">
            Organizations
          </h3>
          <div
            class="grid"
            style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
          >
            <StakeholderCard
              v-for="org of stakeholders?.organizations"
              :key="org.id"
              :name="org.name"
              :description="ORGANIZATION_TYPE_NAME[org.type]"
              :image="org.image ?? undefined"
              :ranking="1"
            />
          </div>
        </div>
        <p
          v-else
          class="text-sm p-4 rounded-lg border-1 border-util-gray-03 bg-util-gray-04"
        >
          Unfortunately, the project owner has not added content for this section.
        </p>
      </el-tab-pane>
    </el-tabs>
    <private-project-tag
      v-if="!project?.isPublished"
      class="justify-self-end "
    />
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import type { TabsPaneContext } from 'element-plus'
import type { ComputedRef } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { ORGANIZATION_TYPE_NAME } from '@rfcx-bio/common/dao/types/organization'

import { getCountryLabel } from '@/_services/country'
import { apiClientKey } from '@/globals'
import StakeholderCard from '@/insights/overview/components/dashboard-project-summary/components/dashboard-project-stakeholders/stakeholder-card.vue'
import { useGetProjectInfo, useGetProjectStakeholders } from '@/projects/_composables/use-project-profile'
import { useProjectDirectoryStore } from '~/store'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import { type HorizontalStack } from '../../insights/overview/components/dashboard-species/components/stack-distribution.vue'
import StackDistribution from '../../insights/overview/components/dashboard-species/components/stack-distribution.vue'
import NumericMetric from '../components/numeric-metric.vue'
import PrivateProjectTag from '../components/private-project-tag.vue'
import { type ProjectProfileWithMetrics } from '../data/types'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits<{(e: 'emitCloseProjectInfo'): void }>()
const activeTab = ref('about')

const pdStore = useProjectDirectoryStore()
const project = computed<ProjectProfileWithMetrics | undefined>(() => {
  const project = pdStore.getProjectWithMetricsById(props.projectId)
  if (!project) { // TODO: fetch from api if there is no metrics in store
    const projectLight = pdStore.getProjectLightById(props.projectId)
    if (projectLight === undefined) return undefined
    return {
      ...projectLight,
      summary: 'This is a test project!',
      objectives: ['bio-baseline'],
      noOfSpecies: 0,
      noOfRecordings: 0,
      countries: [],
      isHighlighted: false,
      isMock: true,
      isPublished: false,
      imageUrl: ''
    }
  }
  return project
})

const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => props.projectId)
const { data: profile, refetch: profileRefetch } = useGetProjectInfo(apiClientBio, selectedProjectId, ['metrics', 'richnessByTaxon', 'readme', 'keyResults'])
const { data: stakeholders, refetch: stakeholdersRefetch, isError: stakeholderError } = useGetProjectStakeholders(apiClientBio, selectedProjectId)

watch(() => props.projectId, () => {
  profileRefetch()
  stakeholdersRefetch()
})

const countrieFlag = computed(() => {
  if (project.value?.countries == null) return ''
  if (project.value?.countries.length > 1) {
    return ''
  } else {
    return project.value?.countries[0]
  }
})

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'Present'
  else return dayjs(date).format('MM/DD/YYYY')
}

// form the total recordings value (minutes or hours)
const totalRecordingsMin = computed(() => profile.value?.metrics?.totalRecordings ?? 0)

const speciesRichnessByTaxon: ComputedRef<HorizontalStack[]> = computed(() => {
  return (profile.value?.richnessByTaxon ?? []).map(([taxonId, count]) => {
    const taxonClass = TAXON_CLASSES_BY_ID[taxonId]
    return {
      id: taxonId,
      name: taxonClass.label,
      color: taxonClass.color,
      count
    }
  })
})

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.info(tab, event)
}

</script>
<style lang="scss">
.normal-flag {
  margin: 1px !important
}
.demo-tabs > .el-tabs__header{
  margin: 0px;
  padding: 4px 16px;
}
</style>
