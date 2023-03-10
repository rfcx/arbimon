<template>
  <nav class="bg-steel-gray">
    <div class="sm:(relative flex justify-between) items-center">
      <div
        class="flex-col sm:(flex-1 flex flex-row items-center) <sm:(border-t-box-gray border-t-1)"
      >
        <router-link
          v-for="(item, idx) in menuItems"
          :key="'insight-menu-' + idx"
          :to="item.destination"
          class="navbar-item navbar-menu-item <sm:(h-10 justify-start pl-4)"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
    <router-view />
  </nav>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

const route = useRoute()

const menuItems = [
    {
      label: 'CNN',
      destination: { name: ROUTE_NAMES.cnnJobList, params: { projectSlug: route.params.projectSlug } }
    }
  ]
</script>
