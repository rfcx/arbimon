<template>
  <section class="bg-white dark:bg-pitch border-y-1 border-frequency">
    <div class="grid grid-row-2 lg:(grid-cols-2 py-10) px-4 py-8 gap-10 max-w-screen-xl mx-auto">
      <div>
        <h4>Powered by data</h4>
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
