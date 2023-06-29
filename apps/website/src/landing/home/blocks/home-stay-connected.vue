<template>
  <section class="dark:bg-pitch px-12 py-20">
    <div class="flex flex-col-reverse gap-4 items-center self-stretch bg-opacity-40 bg-hero-contact bg-cover bg-right rounded-lg border border-frequency h-48 md:(flex-row gap-0 h-56) lg:h-64">
      <div class="basis-full md:basis-3/5 h-full w-full bg-pitch/[.6] rounded-lg">
        <!-- <h2 class="text-2xl leading-10 md:text-3xl xl:text-4xl">
          Stay connected
        </h2>
        <p>Be the first to hear the latest from Arbimon.</p>
        <form>
          <div class="flex flex-col">
            <span class="text-sm">Email address</span>
            <input
              type="text"
              placeholder="Enter your email"
              class="border border-frequency rounded-lg"
            >
          </div>

          <button
            class="btn btn-primary w-32"
          >
            Sign up
          </button> -->
        <div class="flex flex-col p-4 md:(p-8 border-r border-frequency) lg:(p-12) h-full justify-between">
          <div class="flex flex-col gap-2">
            <h2 class="text-2xl leading-10 md:text-3xl xl:text-4xl">
              Stay connected
            </h2>
            <p class="mb-4">
              Be the first to hear the latest from Arbimon.
            </p>
          </div>
          <div>
            <span class="text-sm">Email address</span>
            <form>
              <input
                type="text"
                placeholder="Enter your email"
                class="mr-4 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
              >
              <button
                class="btn btn-primary w-32"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="flex-col basis-full hidden h-64 md:(basis-2/5 block)" />
    </div>
  </section>
</template>
