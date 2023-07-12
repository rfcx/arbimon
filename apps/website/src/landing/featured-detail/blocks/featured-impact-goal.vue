<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-xl text-bold">
        {{ props.title }}
      </p>
      <div class="flex flex-col items-center gap-20">
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
}>()

</script>
