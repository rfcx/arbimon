<template>
  <section class="bg-white dark:bg-pitch border-y-1 border-frequency bg-hero-data bg-cover bg-no-repeat bg-bottom-right">
    <div class="grid grid-row-2 items-center lg:(grid-cols-2 py-10) px-4 py-8 gap-10 max-w-screen-xl mx-auto">
      <div class="text-center lg:text-left">
        <h3 class="text-2xl lg:text-xl font-header">
          Powered by data
        </h3>
        <p>Arbimon’s archive is continuously growing!</p>
      </div>
      <div class="grid grid-cols-3">
        <number-stat
          :number="14000"
          title="Recordings uploaded"
        />
        <number-stat
          :number="6300"
          title="Analyses Performed"
        />
        <number-stat
          :number="134"
          title="Projects Created"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NumberStat from '../components/number-stat.vue'
</script>
