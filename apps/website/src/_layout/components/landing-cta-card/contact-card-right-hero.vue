<template>
  <section class="dark:bg-pitch px-4 sm:px-6 lg:px-20">
    <div class="py-10 lg:py-20 max-w-screen-xl mx-auto">
      <div
        class="flex flex-col-reverse gap-0 items-center rounded-lg border border-frequency md:flex-row"
      >
        <div
          :class="'bg-' + props.textBackground"
          class="basis-full flex-1 md:basis-7/12 bg-opacity-40 bg-left bg-cover self-stretch justify-self-stretch md:(rounded-l-lg border-r border-frequency) rounded-lg"
        >
          <div
            :class="props.flexAlign"
            class="flex flex-col px-4 py-8 md:(px-5 py-10) lg:(px-10 py-20) h-fit justify-between  bg-pitch/[.1] rounded-lg"
          >
            <slot />
          </div>
        </div>
        <div
          :class="'bg-' + props.heroBackground"
          class="basis-full hidden flex-1 self-stretch justify-self-stretch md:(basis-5/12 block) bg-opacity-40 bg-cover rounded-lg"
        >
          <span class="invisible">.</span>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
  textBackground?: string
  heroBackground?: string
  flexAlign?: 'items-start' | 'items-center' | 'items-end' | 'items-stretch'
}>(), {
  textBackground: 'hero-cta-frog',
  heroBackground: 'hero-cta-frog',
  flexAlign: 'items-stretch'
})
</script>
