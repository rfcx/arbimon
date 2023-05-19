<template>
  <navbar />
  <router-view />
  <footerbar />
</template>
<script setup lang="ts">
import Footerbar from '../components/landing-footer.vue'
import Navbar from '../components/landing-navbar/landing-navbar.vue'
</script>
