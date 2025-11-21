<template>
  <img
    v-if="photoUrl"
    :src="photoUrl"
    class="h-14 w-14 aspect-square object-cover rounded bg-util-gray-03"
  >
  <div
    v-else
    class="h-14 w-14 aspect-square object-cover rounded bg-util-gray-03"
  />
  <div class="self-center md:overflow-hidden basis-3/4">
    <router-link
      v-if="redirect === true"
      :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: slug }, query: route.query }"
      :title="scientificName"
      exact-active-class="!dark:text-insight"
      class="text-s italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
      :class="{'text-black' : textBlack}"
    >
      {{ scientificName }}
    </router-link>
    <p
      v-else
      class="text-sm font-normal italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
      :title="scientificName"
      :class="{'text-black' : textBlack}"
    >
      {{ scientificName }}
    </p>
    <p
      class="mt-1 font-medium text-xs tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
      :title="commonName || 'Unknown'"
      :class="{'text-black' : textBlack}"
    >
      {{ commonName || 'Unknown' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

defineProps<{ slug: string, scientificName: string, commonName: string | undefined, photoUrl: string | undefined, redirect: boolean, textBlack: boolean }>()

const route = useRoute()
</script>
