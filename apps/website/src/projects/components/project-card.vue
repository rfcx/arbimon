<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-02 dark:hover:bg-util-gray-02 h-auto"
  >
    <div>
      <img
        :src="project.image?.length === 0 ? image : project.image"
        class="rounded-2xl w-7rem h-7rem object-cover object-center h-52 bg-moss"
      >
      <h6
        class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
        :title="project?.name"
      >
        {{ project.name }}
      </h6>
      <div
        class="mt-3 flex flex-row items-center font-display text-sm mr-2 h-5 whitespace-nowrap text-ellipsis overflow-hidden"
      >
        <span class="text-spoonbill">
          {{ project?.countries?.length !== 0 ? countrie : 'No sites' }}
        </span>
        <div
          class="ml-1 border-l-2 text-ellipsis overflow-hidden"
        >
          <text-tooltip
            :tooltip-id="project?.name"
            :tooltip-text="objectivesLable"
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
      <template v-if="project.isPublished">
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

import image from '@/_assets/cta/frog-hero.webp'
import { ROUTE_NAMES } from '~/router'
import TextTooltip from '../components/text-tooltip.vue'
import { masterOjectiveTypes, objectiveTypes } from '../types'

const props = defineProps<{project: Omit<Project, 'idArbimon'>}>()

const countrie = computed(() => {
  if (props.project?.countries === undefined) return 'No sites'
  return props.project?.countries?.length === 1 ? props.project.countries[0] : 'Multiple countries'
})

const objectives = props.project.objectives?.map((objective) => {
    return objectiveTypes.find((type) => type.slug === objective)?.shorten ?? masterOjectiveTypes.Others.shorten
})
const objectivesLable = objectives?.join(', ')
</script>
