<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
      <div class="grid grid-cols-3 grid-flow-row gap-4">
        <div class="row-span-2">
          <Card />
        </div>
        <div class="col-span-2">
          <Card />
        </div>
        <div class="col-span-2">
          <Card />
        </div>
        <div class="col-span-2">
          <Card />
        </div>
        <div class="row-span-2">
          <Card />
        </div>
        <div class="col-span-2">
          <Card />
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import Card from './components/featured-card.vue'
</script>
