<template>
  <div class="flex flex-row gap-x-2 text-xs font-medium items-center">
    <router-link :to="{ name: ROUTE_NAMES.landingHome }">
      Home
    </router-link>
    <icon-fa-chevron-right class="self-center text-xxs" />
    <router-link :to="{ name: ROUTE_NAMES.explore }">
      Projects
    </router-link>
    <icon-fa-chevron-right class="self-center text-xxs" />
    <router-link
      :to="{ name: ROUTE_NAMES.overview, params: { projectId: selectedProject?.id } }"
      class="font-bold"
    >
      {{ selectedProject?.name }}
    </router-link>
  </div>
</template>
<script setup lang="ts">

import { computed } from 'vue'

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const store = useStore()
const selectedProject = computed(() => store.project)

</script>
