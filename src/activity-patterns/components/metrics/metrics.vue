<template>
  <div class="grid grid-cols-2">
    <template
      v-for="idx in 2"
      :key="idx"
    >
      <single-dataset-component
        :title="'Detection frequency'"
        :value="'25%'"
        :hint="'abc'"
        :description="'xxx'"
        class="px-6 py-4 border-r-2 last:border-none"
      />
    </template>
  </div>
</template>
<script lang="ts" src="./metrics.ts"></script>
