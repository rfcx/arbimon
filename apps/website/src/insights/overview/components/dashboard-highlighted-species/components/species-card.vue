<template>
  <img
    v-if="photoUrl"
    :src="photoUrl"
    class="h-14 w-14 aspect-square object-cover rounded bg-util-gray-02"
  >
  <div
    v-else
    class="h-14 w-14 aspect-square object-cover rounded bg-util-gray-02"
  />
  <div class="self-center md:overflow-hidden">
    <router-link
      v-if="redirect === true"
      :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: slug }, query: $route.query }"
      :title="scientificName"
      exact-active-class="!text-gray-900 !dark:text-insight"
      class="text-sm italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis) flex-initial"
    >
      {{ scientificName }}
    </router-link>
    <p
      v-else
      class="text-s italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis) flex-initial "
      :title="scientificName"
    >
      {{ scientificName }}
    </p>
    <p
      class="mt-1 text-xs tracking-tight line-clamp-1 md:(overflow-hidden text-ellipsis) flex-initial"
      :title="commonName || 'Unknown'"
    >
      {{ commonName || 'Unknown' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'

defineProps<{ slug: string, scientificName: string, commonName: string | undefined, photoUrl: string | undefined, redirect: boolean }>()

</script>
