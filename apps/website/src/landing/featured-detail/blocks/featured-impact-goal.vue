<template>
  <section class="bg-white dark:bg-moss">
    <div class="pb-30 px-4 mx-auto max-w-screen-sm lg:px-6">
      <div
        v-if="image"
        class="mb-6"
      >
        <img
          class="object-cover w-full h-96 rounded-lg"
          :src="props.image"
        >
      </div>
      <h3 class="mb-6 font-medium">
        {{ props.title }}
      </h3>
      <div class="flex flex-col items-center gap-10">
        <p>{{ props.text }} </p>
        <a
          v-if="props.ctaLink"
          :href="props.ctaLink"
          class="items-center justify-center w-64 btn btn-primary"
        >
          {{ props.ctaText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

const props = defineProps<{
  readonly title: string
  readonly text: string
  readonly ctaText: string
  readonly ctaLink: string
  readonly image: string
}>()

</script>
