<template>
  <section class="bg-white dark:bg-echo">
    <div class="w-full h-64 lg:h-84 bg-hero-featured-works bg-cover bg-no-repeat bg-right border-b border-b-frequency">
      <div class="grid lg:grid-cols-16 max-w-screen-xl mx-auto px-4 h-full">
        <div class="my-8 lg:(col-span-7 my-24)">
          <slot />
        </div>
        <div class="hidden not-sr-only">
          .
        </div>
      </div>
    </div>
  </section>
</template>
