<template>
  <section class="dark:bg-pitch px-4 sm:px-6 lg:px-20">
    <div class="py-10 lg:py-20 max-w-screen-xl mx-auto">
      <div
        class="flex flex-col-reverse gap-0 items-center rounded-xl border border-frequency md:flex-row"
      >
        <div
          :class="'bg-' + textBackground"
          class="basis-full flex-1 md:basis-7/12 bg-opacity-40 bg-left bg-cover self-stretch justify-self-stretch md:(rounded-l-xl rounded-r-none border-r border-frequency) rounded-xl"
        >
          <div
            :class="flexAlign"
            class="flex flex-col px-4 py-8 md:(px-5 py-10) lg:(px-10 py-20) h-fit justify-between bg-pitch/[.6] blur-sm rounded-xl md:(rounded-l-xl rounded-r-none)"
          >
            <slot />
          </div>
        </div>
        <div
          :class="'bg-' + heroBackground"
          class="basis-full hidden flex-1 self-stretch justify-self-stretch md:(basis-5/12 block rouned-r-lg rounded-l-none) bg-opacity-40 bg-cover rounded-xl"
        >
          <span class="invisible">.</span>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  textBackground?: string
  heroBackground?: string
  flexAlign?: 'items-start' | 'items-center' | 'items-end' | 'items-stretch'
}>(), {
  textBackground: 'hero-cta-frog',
  heroBackground: 'hero-cta-frog-bg',
  flexAlign: 'items-stretch'
})
</script>
