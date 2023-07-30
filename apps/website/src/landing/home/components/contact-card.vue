<template>
  <section class="dark:bg-pitch">
    <div class="px-6 py-10 lg:py-20 max-w-screen-xl mx-auto">
      <div
        :class="'bg-' + props.heroBackground"
        class="flex flex-col-reverse gap-4 items-center bg-opacity-40 bg-cover bg-right rounded-lg border border-frequency md:(flex-row gap-0)"
      >
        <div class="basis-full flex-1 md:basis-7/12 bg-pitch/[.6] self-stretch justify-self-stretch rounded-l-lg border-r border-frequency">
          <div
            :class="props.flexAlign"
            class="flex flex-col px-4 py-8 md:(px-5 py-10) lg:(px-10 py-20) h-fit justify-between"
          >
            <slot />
          </div>
        </div>
        <div class="flex-col basis-full hidden h-70 invisible not-sr-only md:(basis-5/12 block)" />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
  heroBackground: string
  flexAlign: 'items-start' | 'items-center' | 'items-end' | 'items-stretch'
}>(), {
  heroBackground: 'hero-contact',
  flexAlign: 'items-stretch'
})
</script>
