<template>
  <section class="bg-white dark:bg-moss">
    <div class="py-8 px-4 mx-auto max-w-screen-lg xl:gap-16 sm:py-16 lg:px-6">
      <p class="mb-8 text-xl text-bold">
        {{ props.title }}
      </p>
      <div class="flex flex-col gap-8 lg:flex-row">
        <p>{{ props.text }} </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

const props = defineProps<{
  readonly title: string
  readonly text: string
}>()

</script>
