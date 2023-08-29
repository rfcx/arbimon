<template>
  <div
    class="w-full rounded-2xl bg-steel-gray p-4 flex justify-between"
  >
    <div class="font-medium">
      {{ title }}
    </div>
    <div class="flex">
      <template v-if="subtitle">
        {{ subtitle }}
      </template>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-sidebar-title.ts"></script>
