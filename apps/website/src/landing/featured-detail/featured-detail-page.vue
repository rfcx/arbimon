<template>
  <section class="bg-white dark:bg-mirage-gray">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Restoring the Brazilian Atlantic Forest
        </h2>
      </div>
    </div>
  </section>

  <section class="bg-white dark:bg-mirage-gray">
    <div class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
      <img
        class="w-full dark:hidden"
        src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
        alt="dashboard image"
      >
      <img
        class="w-full hidden dark:block"
        src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
        alt="dashboard image"
      >
      <div class="mt-4 md:mt-0">
        <h2 class="mb-4 text-2xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Results
        </h2>
        <p class="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
          We collected over 1 million minutes of recordings, which is equal to 694 days! We detected 178 species, including threatened species such as the black lion tamarin and bare-throated bellbird found only in the Atlantic Forest! We've found that restoration sites are able to host a similar number of bird species as forests. However, restoration and forest sites did have slightly different types of bird species (known as species composition), with forested sites having more large-bodied, fruit-eating species and restoration sites having more generalist species.
        </p>
        <router-link
          to="/p/sounds-of-atlantic-forest"
          class="inline-flex items-center text-white bg-primary hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900"
        >
          See detailed results
          <svg
            class="ml-2 -mr-1 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          /></svg>
        </router-link>
      </div>
    </div>
  </section>
</template>
