<template>
  <team-hero />
  <section class="bg-white dark:bg-pitch">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center sm:py-16 lg:px-6å">
      <team-member-list />
    </div>
  </section>
  <team-cta />
</template>
<script setup lang="ts">
import teamCta from './blocks/team-cta.vue'
import teamHero from './blocks/team-hero.vue'
import teamMemberList from './blocks/team-member-list.vue'
</script>
