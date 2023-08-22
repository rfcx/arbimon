<template>
  <section class="dark:bg-pitch px-4 sm:px-6 lg:px-20">
    <div class="py-10 lg:py-20 max-w-screen-xl mx-auto">
      <div
        class="flex flex-col-reverse gap-0 items-center rounded-2xl border border-frequency md:flex-row"
      >
        <div
          :class="'bg-' + textBackground"
          class="basis-full flex-1 md:basis-7/12 bg-opacity-40 bg-left bg-cover self-stretch justify-self-stretch md:(rounded-l-2xl rounded-r-none border-r border-frequency) rounded-2xl"
        >
          <div
            :class="flexAlign"
            class="flex flex-col px-4 py-8 md:(px-5 py-10) lg:(px-10 py-20) h-fit justify-between bg-pitch/[.6] blur-md rounded-2xl md:(rounded-l-2xl rounded-r-none)"
          >
            <slot />
          </div>
        </div>
        <div
          :class="`bg-${heroBackground} ${backgroundPosition != null ? `bg-${backgroundPosition}` : ''}`"
          class="basis-full hidden flex-1 self-stretch justify-self-stretch md:(basis-5/12 block rouned-r-lg rounded-l-none) bg-opacity-40 bg-cover rounded-2xl"
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
  flexAlign?: 'items-start' | 'items-center' | 'items-end' | 'items-stretch',
  // INFO: https://tailwindcss.com/docs/background-position
  backgroundPosition?: 'bottom' | 'center' | 'left' | 'left-bottom' | 'left-top' | 'right' | 'right-bottom' | 'right-top' | 'top'
}>(), {
  textBackground: 'hero-cta-frog',
  heroBackground: 'hero-cta-frog-bg',
  flexAlign: 'items-stretch',
  backgroundPosition: undefined
})
</script>
