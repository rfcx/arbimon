<template>
  <section class="bg-white dark:bg-pitch border-y-1 border-frequency bg-hero-data bg-cover bg-no-repeat bg-bottom-right">
    <div class="flex flex-col items-center justify-between lg:flex-row lg:py-10 px-4 py-20 gap-10 max-w-screen-xl mx-auto">
      <div class="text-center xl:w-52">
        <h3 class="text-2xl lg:text-xl font-medium font-header">
          Powered by data
        </h3>
        <p>Arbimon’s archive is continuously growing!</p>
      </div>
      <div class="grid grid-cols-2 gap-4 grid-flow-row lg:grid-cols-4">
        <number-stat
          :number="127413944"
          title="Recordings uploaded"
        />
        <number-stat
          :number="1016249315"
          title="Analyses performed"
        />
        <number-stat
          :number="3677"
          title="Projects created"
        />
        <number-stat
          :number="3561"
          title="Species identified"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NumberStat from '../components/number-stat.vue'
</script>
