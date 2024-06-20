<template>
  <div
    ref="projectInfoView"
    class="flex flex-col justify-between left-100 w-98 h-86vh bg-moss transition-transform -translate-x-full rounded-lg overflow-scroll"
  >
    <div
      v-if="isErrorProfile"
      class="flex items-center justify-center h-full"
    >
      <div class="p-4">
        <div class="text-s text-center">
          <span>It seems the project didn’t load as expected. <br>
            Please refresh your browser to give it another go.</span>
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex flex-col"
    >
      <div class="rounded-t-lg bg-moss">
        <div class="flex flex-row justify-between items-center">
          <div
            v-if="isLoadingProfile || isRefetchingProfile"
            class="h-4 dark:bg-util-gray-03 rounded w-40 m-3 ml-4 align-baseline loading-shimmer"
          />
          <div
            v-else
            class="flex flex-1 flex-row items-center"
          >
            <span
              class="text-spoonbill font-medium text-xs ml-4 my-3.5"
            >{{ getCountryLabel(profile?.countryCodes ?? [], 1) }}</span>
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
              v-if="profile?.countryCodes ? profile?.countryCodes.length > 1 : false"
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
      <div v-if="isLoadingProfile || isRefetchingProfile">
        <div class="w-full h-52 dark:bg-util-gray-03 rounded sm:w-96 loading-shimmer" />
        <div class="p-4 border-b border-util-gray-03">
          <div class="h-6 dark:bg-util-gray-03 rounded w-40 my-2 loading-shimmer" />
          <div class="h-4 dark:bg-util-gray-03 rounded w-11/12 my-2 loading-shimmer" />
        </div>
        <div class="p-4">
          <div
            v-for="index in 4"
            :key="index"
            class="h-5 bg-util-gray-03 rounded dark:bg-util-gray-03 w-full my-3 loading-shimmer"
          >
              &nbsp;
          </div>
        </div>

        <div class="h-36 rounded w-11/12 my-2">
          &nbsp;
        </div>
      </div>
      <div v-else>
        <img
          v-if="profile?.image"
          :src="urlWrapper(profile.image)"
          class="w-full object-cover aspect-auto bg-util-gray-03 h-52"
        >
        <div
          v-else
          class="w-full h-52 object-contain bg-util-gray-03 flex justify-center items-center"
        />
        <div class="p-4 border-b border-util-gray-03">
          <span class="text-lg font-medium">{{ profile?.name }}</span>
          <div
            class="flex font-medium text-sm flex-row border-util-gray-01 mt-3 space-x-2 font-display items-center"
          >
            <span>
              Project dates:
            </span>
            <span>
              {{ dateLabel(profile?.dateStart) }}
            </span>
            <icon-custom-arrow-right-white class="self-start" />
            <span>
              {{ dateLabel(profile?.dateEnd) }}
            </span>
          </div>
          <router-link
            v-if="profile?.isPublished"
            :to="`/p/${profile?.slug}`"
            class="text-frequency"
          >
            <button
              class="btn btn-primary w-full mt-10"
              :class="{'opacity-50 cursor-not-allowed': !profile?.isPublished}"
            >
              View project insights
            </button>
          </router-link>
        </div>
        <div class="p-4">
          <numeric-metric
            tooltip-id="deployment-sites"
            tooltip-text="Number of sites with recorders deployed."
            title="Project sites:"
            :value="profile?.metrics?.totalSites ?? 0"
            icon-name="ft-map-pin-lg"
            class="flex-1"
          />
          <numeric-metric
            tooltip-id="threatened-species-over-all-species"
            title="Threatened / total species:"
            tooltip-text="Number of Near Threatened, Vulnerable, Endangered, & Critically Endangered species over total species found."
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
            :tooltip-text="`Total minutes of recordings captured.`"
            :title="`Minutes of recordings:`"
            :value="totalRecordingsMin"
            icon-name="ft-mic-lg"
            class="flex-1"
          />
        </div>
        <div class="border-t-1 border-util-gray-03 px-4 mb-4">
          <h4 class="mt-4 font-medium mb-2">
            Taxonomic groups
          </h4>
          <p class="text-xs mb-2">
            Number of species detected in each taxonomic group.
          </p>
          <stack-distribution
            :dataset="speciesRichnessByTaxon"
            :known-total-count="`${profile?.metrics?.totalSpecies ?? 0}`"
            :small-version="true"
            simple-no-data-text="This project has no species detection"
            class="my-4 text-xs"
          />
        </div>
      </div>
      <div
        v-if="profile?.isPublished"
        v-show="!isLoadingProfile && !isRefetchingProfile"
        class="border-t border-util-gray-03"
      >
        <div class="grid grid-cols-3 border-b-2 border-util-gray-03 h-12 items-center">
          <div
            :class="{ 'text-frequency border-b-2 border-frequency': activeTab === 'about' }"
            class="relative overflow-hidden mb-[-1px] font-medium text-center cursor-pointer py-3 hover:text-frequency"
            @click="activeTab = 'about'"
          >
            About
          </div>
          <div
            :class="{ 'text-frequency border-b-2 border-frequency': activeTab === 'keyResult' }"
            class="relative overflow-hidden mb-[-1px] font-medium text-center cursor-pointer py-3 hover:text-frequency"
            @click="activeTab = 'keyResult'"
          >
            Key Result
          </div>
          <div
            :class="{ 'text-frequency border-b-2 border-frequency': activeTab === 'stakeholders' }"
            class="relative overflow-hidden mb-[-1px] font-medium text-center cursor-pointer py-3 hover:text-frequency"
            @click="activeTab = 'stakeholders'"
          >
            Stakeholders
          </div>
        </div>

        <div
          :class="activeTab === 'about' ? 'block' : 'hidden'"
        >
          <p
            v-if="profile?.readme"
            class="pt-4"
          >
            <DashboardMarkdownViewerEditor
              id="about"
              v-model:is-view-mored="isAboutTabViewMored"
              v-model:is-editing="isAboutTabEditing"
              :status="getProjectInfoStatus"
              on-save-error-message=""
              :editable="false"
              :raw-markdown-text="profile?.readme"
              :default-markdown-text="readmeDefault"
              :is-project-member="false"
              :is-viewing-as-guest="true"
            />
          </p>
          <div v-else>
            <no-content-banner />
          </div>
        </div>
        <div
          :class="activeTab === 'keyResult' ? 'block' : 'hidden'"
        >
          <p
            v-if="profile?.keyResult"
            class="pt-4"
          >
            <DashboardMarkdownViewerEditor
              id="key-result"
              v-model:is-view-mored="isKeyResultTabViewMored"
              v-model:is-editing="isKeyResultTabEditing"
              :status="getProjectInfoStatus"
              on-save-error-message=""
              :editable="false"
              :raw-markdown-text="profile?.keyResult"
              :default-markdown-text="keyResultDefault"
              :is-project-member="false"
              :is-viewing-as-guest="false"
            />
          </p>
          <div v-else>
            <no-content-banner />
          </div>
        </div>
        <div
          :class="activeTab === 'stakeholders' ? 'block' : 'hidden'"
        >
          <div v-if="shouldShowStakeholdersContent">
            <div
              class="grid mt-4"
              style="grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr))"
            >
              <DashboardProjectStakeholdersViewer
                :editable="false"
                :is-project-member="false"
                :is-external-guest="true"
                :loading="stakeholdersLoading || stakeholdersRefetching"
                :organizations="stakeholders?.organizations ?? []"
                :project-members="stakeholders?.users.filter(u => u.ranking !== -1).sort((a, b) => a.ranking - b.ranking) ?? []"
                @emit-is-updating="false"
              />
            </div>
          </div>
          <div v-else>
            <no-content-banner />
          </div>
        </div>
      </div>
    </div>
    <private-project-tag
      v-if="!profile?.isPublished"
      v-show="!isLoadingProfile && !isRefetchingProfile"
      class="justify-self-end"
    />
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import type { ComputedRef } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import CountryFlag from 'vue-country-flag-next'

import { getCountryLabel } from '@/_services/country'
import { urlWrapper } from '@/_services/images/url-wrapper'
import { apiClientKey } from '@/globals'
import DashboardMarkdownViewerEditor from '@/insights/overview/components/dashboard-project-summary/components/dashboard-markdown-viewer-editor.vue'
import DashboardProjectStakeholdersViewer from '@/insights/overview/components/dashboard-project-summary/components/dashboard-project-stakeholders/dashboard-project-stakeholders-viewer.vue'
import { useMarkdownEditorDefaults } from '@/insights/overview/composables/use-markdown-editor-defaults'
import { useGetProjectInfo, useGetProjectStakeholders } from '@/projects/_composables/use-project-profile'
import { TAXON_CLASSES_BY_ID } from '~/taxon-classes'
import { type HorizontalStack } from '../../insights/overview/components/dashboard-species/components/stack-distribution.vue'
import StackDistribution from '../../insights/overview/components/dashboard-species/components/stack-distribution.vue'
import NoContentBanner from '../components/no-content-banner.vue'
import NumericMetric from '../components/numeric-metric.vue'
import PrivateProjectTag from '../components/private-project-tag.vue'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits<{(e: 'emitCloseProjectInfo'): void }>()
const activeTab = ref('about')

const projectInfoView = ref<HTMLElement | null>(null)

const { readme: readmeDefault, keyResult: keyResultDefault } = useMarkdownEditorDefaults()
const isStakeholdersSelected = ref(false)

const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProjectId = computed(() => props.projectId)
const { isLoading: isLoadingProfile, status: getProjectInfoStatus, data: profile, refetch: profileRefetch, isRefetching: isRefetchingProfile, isError: isErrorProfile } = useGetProjectInfo(apiClientBio, selectedProjectId, ['metrics', 'richnessByTaxon', 'readme', 'keyResult', 'countryCodes', 'image'], computed(() => true))
const { isLoading: stakeholdersLoading, data: stakeholders, refetch: stakeholderRefetch, isRefetching: stakeholdersRefetching, isError: stakeholderError } = useGetProjectStakeholders(apiClientBio, selectedProjectId, computed(() => isStakeholdersSelected.value))

const isAboutTabViewMored = ref(false)
const isAboutTabEditing = ref(false)

const isKeyResultTabViewMored = ref(false)
const isKeyResultTabEditing = ref(false)

const shouldShowStakeholdersContent = computed(() => {
  const hasOrganizations = (stakeholders.value?.organizations && stakeholders.value?.organizations.length > 0) ?? false
  const hasUsers = (stakeholders.value?.users && stakeholders.value?.users.length > 0) ?? false
  return (hasUsers || hasOrganizations) && !stakeholderError.value
})

watch(() => props.projectId, async (newValue, oldValue) => {
  if (newValue === oldValue) { return }
  // reset the scroll position & active tab
  if (projectInfoView.value) { projectInfoView.value.scrollTop = 0 }
  activeTab.value = 'about'
  await profileRefetch()
})

watch(activeTab, async (newValue, oldValue) => {
  if (newValue === oldValue) { return }
  if (activeTab.value === 'stakeholders') {
    isStakeholdersSelected.value = true
    await stakeholderRefetch()
  } else {
    isStakeholdersSelected.value = false
  }
})

const countrieFlag = computed(() => {
  if (profile.value?.countryCodes == null) return ''
  if (profile.value?.countryCodes.length > 1) {
    return ''
  } else {
    return profile.value?.countryCodes[0]
  }
})

const formatDateRange = (date: Date | null | undefined): string => {
  if (!dayjs(date).isValid()) return 'Present'
  else return dayjs(date).format('MM/DD/YYYY')
}

const dateLabel = (date: Date | null | undefined): string => {
  if (profile.value?.dateStart) {
    return formatDateRange(date)
  } else {
    return 'N/A'
  }
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
      text: taxonClass.text,
      count
    }
  })
})

</script>
<style lang="scss">
.normal-flag {
  margin: 1px !important
}

</style>
