<template>
  <section class="bg-white dark:bg-echo">
    <div
      :style="`background-image: url(${heroImageUrl});`"
      class="w-full h-64 lg:h-96 bg-cover bg-no-repeat bg-right-top border-b border-b-frequency"
      :class="{
        'border-b border-b-frequency': withBorderBottom,
        'border-b-0': !withBorderBottom
      }"
    >
      <div class="grid lg:(grid-cols-16 px-10) max-w-screen-xl mx-auto px-4 h-full">
        <div class="my-auto lg:(col-span-7)">
          <slot />
        </div>
        <div class="hidden not-sr-only">
          .
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  heroImageUrl: string
  withBorderBottom?: boolean
}>(), {
  heroImageUrl: '/src/_assets/landing/featured/feature-hero.webp',
  withBorderBottom: true
})
</script>
