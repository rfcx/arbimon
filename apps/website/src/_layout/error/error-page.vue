<template>
  <div>
    <navbar />
    <div class="text-fog p-10 lg:p-20">
      <span v-if="route.query.error">{{ route.query.error }}</span>
      <span v-else>Page not found</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import Navbar from '@/_layout/components/landing-navbar/landing-navbar.vue'

const route = useRoute()
</script>
