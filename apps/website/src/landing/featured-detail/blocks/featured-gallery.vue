<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-16 mx-auto gap-2 xl:gap-8 md:py-8 grid lg:grid-cols-2">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="relative pb-[50%] h-0"
      >
        <img
          :src="image"
          class="absolute w-full h-full"
          :class="{
            'lg:rounded-r-lg': index/2 === 0,
            'lg:rounded-l-lg': index/2 !== 0
          }"
        >
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{
  readonly images: string[] | []
}>()
</script>
