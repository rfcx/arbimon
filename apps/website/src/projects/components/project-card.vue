<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-03 dark:hover:bg-util-gray-04 h-auto"
    @click="$emit('on-click-project', true)"
  >
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
      <h6
        class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
        :title="project?.name"
      >
        {{ project.name }}
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

import type { Project } from '@rfcx-bio/common/dao/types'

import { getCountryLabel } from '@/_services/country'
import { urlWrapper } from '@/_services/images/url-wrapper'
import { ROUTE_NAMES } from '~/router'
import TextTooltip from '../components/text-tooltip.vue'
import { masterObjectiveTypes } from '../types'

const props = defineProps<{project: Omit<Project, 'idArbimon'> }>()
defineEmits<{(e: 'on-click-project', value: boolean): void}>()

const countries = computed(() => {
  return props.project.countries ?? []
})

const objectives = props.project.objectives?.map((objective) => {
    return Object.values(masterObjectiveTypes).find((type) => type.slug === objective)?.shorten ?? masterObjectiveTypes.Others.shorten
})
const objectivesLabel = objectives?.join(', ')
</script>
