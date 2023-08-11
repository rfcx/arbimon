<template>
  <team-hero />
  <team-purpose />
  <team-member-list />
  <team-gallery />
  <team-cta />
  <footer-contact />
</template>
<script setup lang="ts">
import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import teamCta from './blocks/team-cta.vue'
import teamGallery from './blocks/team-gallery.vue'
import teamHero from './blocks/team-hero.vue'
import teamMemberList from './blocks/team-member-list.vue'
import teamPurpose from './blocks/team-purpose.vue'
</script>
