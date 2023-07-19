<template>
  <section class="dark:bg-pitch">
    <div class="p-20 max-w-screen-xl mx-auto">
      <div class="flex flex-col-reverse gap-4 items-center self-stretch bg-opacity-40 bg-hero-contact bg-cover bg-right rounded-lg border border-frequency md:(flex-row gap-0 h-70) lg:h-80 min-h-70">
        <div class="basis-full md:basis-3/5 h-full w-full bg-pitch/[.6] rounded-lg">
          <div class="flex flex-col px-4 py-8 md:(px-5 py-10 border-r border-frequency) xl:(px-10 py-20) h-full justify-between">
            <slot />
          </div>
        </div>
        <div class="flex-col basis-full hidden h-64 md:(basis-2/5 block)" />
      </div>
    </div>
  </section>
</template>
