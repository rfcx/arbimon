<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p>{{ subheader }}</p>
    </div>
  </section>
</template>

<script setup type="ts">
defineProps({
  subheader: { type: String, default: '.....' }
  })
</script>
