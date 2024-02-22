<template>
  <div class="fixed inset-0 flex flex-col justify-center items-center">
    <icon-custom-ic-loading class="w-10 h-10" />
  </div>
  <nav class="fixed top-0 z-50 w-full bg-white border-gray-200 dark:bg-echo dark:border-frequency border-b-1">
    <a
      class="flex items-center px-3 py-3 lg:px-5 lg:pl-3"
      href="/"
    ><brand-logo /></a>
  </nav>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import BrandLogo from '@/_layout/components/brand-logo.vue'

const router = useRouter()
let timeoutId: number

onMounted(() => {
  // In case a user navigates to /callback not from auth, redirect them home
  timeoutId = setTimeout(() => router.push({ path: '/' }), 5000) as unknown as number
})

onUnmounted(() => {
  clearTimeout(timeoutId)
})
</script>
