<template>
  <section class="bg-white dark:bg-pitch">
    <div class="max-w-screen-xl mx-auto py-10 px-6 md:px-10 flex flex-col gap-y-4">
      <publication-card
        v-for="publication in sortByYearPublications"
        :key="publication.title"
        :publication="publication"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import publicationCard from '../components/publication-card.vue'
import { publications } from '../data'

const sortByYearPublications = publications.sort((a, b) => {
  return b.year - a.year
})
</script>
