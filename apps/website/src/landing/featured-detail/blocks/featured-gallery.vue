<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-16 mx-auto gap-2 xl:gap-8 md:py-8 lg:grid lg:grid-cols-2">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        class="w-full h-max-[369px] rounded-lg object-cover"
      >
    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{
  readonly images: string[] | []
}>()
</script>
