<template>
  <section class="bg-white dark:bg-echo">
    <publication-hero />
    <publication-stat
      :count-citation="citationCount"
      :count-publication="paperPublisheCount"
    />
    <publication-list />
  </section>
</template>
<script setup lang="ts">
import publicationStat from './blocks/publications-data-stat.vue'
import publicationHero from './blocks/publications-hero.vue'
import publicationList from './blocks/publications-list.vue'
import { citationCount, paperPublisheCount } from './data'
</script>
