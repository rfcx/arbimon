<template>
  <section class="dark:bg-pitch px-12 py-20">
    <div class="flex flex-col-reverse gap-4 items-center self-stretch bg-opacity-40 bg-hero-contact bg-cover bg-right rounded-lg border border-frequency h-56 md:(flex-row gap-0 h-60) lg:h-64">
      <div class="basis-full md:basis-3/5 h-full w-full bg-pitch/[.6] rounded-lg">
        <div class="flex flex-col p-4 md:(p-8 border-r border-frequency) lg:(p-12) h-full justify-between">
          <slot />
        </div>
      </div>
      <div class="flex-col basis-full hidden h-64 md:(basis-2/5 block)" />
    </div>
  </section>
</template>
