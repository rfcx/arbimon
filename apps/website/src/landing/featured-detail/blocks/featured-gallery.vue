<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-16 mx-auto gap-2 xl:gap-8 md:py-8 grid lg:grid-cols-2">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        class="w-full h-max-[460px] object-cover"
        :class="{
          'lg:rounded-r-lg': index/2 === 0,
          'lg:rounded-l-lg': index/2 !== 0
        }"
      >
    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{
  readonly images: string[] | []
}>()
</script>
