<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-03 dark:hover:bg-util-gray-04 h-auto"
    @click="$emit('on-click-project', true)"
  >
    <div>
      <div class="flex justify-between flex-row">
        <div>
          <img
            v-if="project.image"
            :src="urlWrapper(project.image)"
            class="rounded-2xl w-7rem h-7rem object-cover object-center h-52 bg-util-gray-03"
          >
          <div
            v-else
            class="rounded-2xl w-7rem h-7rem object-cover object-center h-52 bg-util-gray-03 flex justify-center items-center"
          />
        </div>
        <ProjectStateBadge
          v-if="project"
          :project-type="project.projectType"
          :is-locked="project.isLocked"
          :is-hide-tooltip="true"
        />
      </div>
      <h6
        class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight !overflow-visible relative"
        :title="project?.name"
      >
        {{ project.name }}

        <div
          v-if="project.isOwner"
          class="relative group inline-flex items-center ml-1 z-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            class="text-amber-500 w-4 h-4"
          >
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
          </svg>

          <div
            class="absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
       px-2 py-1 text-[10px] font-medium text-black bg-white rounded shadow-sm
       bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
          >
            Primary Admin
          </div>
        </div>
      </h6>

      <div
        class="mt-3 gap-x-1 flex flex-row items-center font-display text-sm mr-2 h-5 whitespace-nowrap text-ellipsis overflow-hidden"
      >
        <span class="text-spoonbill">
          <text-tooltip
            :tooltip-id="`${props.project.id}-country`"
            :text-shorten="getCountryLabel(countries, 1)"
            :text-full="getCountryLabel(countries, countries.length)"
          />
        </span>
        <div
          class="pl-1 border-l-2 text-ellipsis overflow-hidden"
        >
          <text-tooltip
            :tooltip-id="project?.name"
            :text-shorten="objectivesLabel"
            :text-full="objectivesLabel"
          />
        </div>
      </div>
      <p
        class="mt-3 font-normal line-clamp-3 text-gray-700 dark:text-insight"
        :title="project?.name"
      >
        {{ project?.summary }}
      </p>
    </div>
    <div>
      <template v-if="project.status === 'published'">
        <div class="mt-4">
          <icon-custom-fi-eye class="inline-flex text-insight mr-2" /> Live on Arbimon’s Project
        </div>
      </template>
      <template v-else>
        <div class="mt-4">
          <icon-custom-fi-eye-off class="inline-flex text-insight mr-2" /> Hidden to non-project members
        </div>
      </template>
    </div>
  </router-link>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { type LocationProjectWithInfo } from '@rfcx-bio/common/api-bio/project/projects'

import { getCountryLabel } from '@/_services/country'
import { urlWrapper } from '@/_services/images/url-wrapper'
import ProjectStateBadge from '@/projects/components/project-state-badge.vue'
import { ROUTE_NAMES } from '~/router'
import TextTooltip from '../components/text-tooltip.vue'
import { masterObjectiveTypes } from '../types'

const props = defineProps<{project: Omit<LocationProjectWithInfo, 'idArbimon'> }>()
defineEmits<{(e: 'on-click-project', value: boolean): void}>()

const countries = computed(() => {
  return props.project.countries ?? []
})

const objectives = props.project.objectives?.map((objective) => {
    return Object.values(masterObjectiveTypes).find((type) => type.slug === objective)?.shorten ?? masterObjectiveTypes.Others.shorten
})
const objectivesLabel = objectives?.join(', ')
</script>
