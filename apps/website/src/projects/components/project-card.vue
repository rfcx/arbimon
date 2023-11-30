<template>
  <router-link
    :to="{ name: ROUTE_NAMES.dashboard, params: { projectSlug: project.slug }}"
    class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-moss dark:border-util-gray-02 dark:hover:bg-util-gray-02 h-auto"
  >
    <imageCard
      class="image-size"
      :src="image"
    />
    <h6
      class="mb-2 mt-6 font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-insight"
      :title="project?.name"
    >
      {{ project.name }}
    </h6>
    <div
      class="mt-3 flex flex-row items-center font-display text-sm mr-2 h-5 overflow-hidden"
      style="{ overflow: hidden; white-space: nowrap; text-overflow: ellipsis }"
    >
      <span class="text-spoonbill">
        {{ project?.countries?.length !== 0 ? countrie : 'Multiple countries' }}
      </span>
      <div
        class="ml-1 border-l-2"
        style="overflow: hidden; text-overflow: ellipsis;"
      >
        <span class="ml-1">
          {{ objective }}
        </span>
      </div>
    </div>
    <p
      class="mt-3 font-normal line-clamp-3 text-gray-700 dark:text-insight"
      :title="project?.name"
    >
      {{ project?.summary }}
    </p>
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
  </router-link>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import type { Project } from '@rfcx-bio/common/dao/types'

import image from '@/_assets/cta/frog-hero.webp'
import imageCard from '@/landing/team/components/image-card.vue'
import { ROUTE_NAMES } from '~/router'
import { masterOjectiveTypes } from '../types'

const props = defineProps<{project: Omit<Project, 'idArbimon'>}>()

const countrie = props.project?.countries !== undefined ? props.project.countries[0] : ''

const objective = computed(() => {
  let text = ''
  props.project.objectives?.forEach(obj => {
    if (obj === masterOjectiveTypes.BioBaseline.slug) {
      text = text + masterOjectiveTypes.BioBaseline.shorten
    } else if (obj === masterOjectiveTypes.MonitorSpecies.slug) {
      text = text + masterOjectiveTypes.MonitorSpecies.shorten
    } else if (obj === masterOjectiveTypes.MonitorIllegalAct.slug) {
      text = text + masterOjectiveTypes.MonitorIllegalAct.shorten
    } else if (obj === masterOjectiveTypes.ImpactHuman.slug) {
      text = text + masterOjectiveTypes.ImpactHuman.shorten
    } else if (obj === masterOjectiveTypes.ImpactConservation.slug) {
      text = text + masterOjectiveTypes.ImpactConservation.shorten
    } else {
      text = text + masterOjectiveTypes.Others.shorten
    }

    if (props.project.objectives?.length !== 1 && obj !== props.project.objectives?.slice(-1)[0]) {
      text = text + ', '
    }
  })
  return text
})
</script>

<style lang="scss">
.image-size {
  height: 7rem !important;
  width: 7rem !important;
}
</style>
