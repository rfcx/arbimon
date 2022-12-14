<template>
  <div
    class="w-full rounded-2xl bg-steel-grey p-4 flex justify-between"
  >
    <div class="font-semibold">
      {{ title }}
    </div>
    <div class="flex">
      <template v-if="subtitle">
        {{ subtitle }}
      </template>
      <icon-fa-chevron-down class="text-xxs self-center" />
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-sidebar-title.ts"></script>
