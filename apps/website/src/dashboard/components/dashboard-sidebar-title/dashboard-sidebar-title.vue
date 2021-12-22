<template>
  <router-link
    class="w-full rounded-2xl bg-steel-grey my-4 p-4 flex justify-between"
    :to="route"
  >
    <div class="font-semibold">{{ title }}</div>
    <div class="flex">
      <template v-if="subtitle">{{ subtitle }}</template>
      <icon-fas-angle-right class="font-semibold self-center" />
    </div>
  </router-link>
</template>
<script lang="ts" src="./dashboard-sidebar-title.ts"></script>
