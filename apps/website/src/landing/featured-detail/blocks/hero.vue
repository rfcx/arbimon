<template>
  <section class="bg-white dark:bg-echo">
    <div class="gap-16 items-center py-8 px-4 mx-auto max-w-screen-2xl lg:grid lg:grid-cols-3 lg:px-6">
      <div class="text-gray-500 dark:text-insight col-span-2">
        <router-link
          to="/featured"
          class="text-sm flex items-center hover:text-frequency"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="insight"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-insight hover:stroke-frequency transition-colors duration-300"
          >
            <path
              d="M12.6666 8H3.33325"
              stroke="insight"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7.99992 12.6666L3.33325 7.99992L7.99992 3.33325"
              stroke="insight"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="ml-1 hover:text-frequency">Back to featured work</span>
        </router-link>
        <h2 class="mt-12 my-4 text-4xl capitalize font-extrabold text-gray-900 dark:text-insight">
          {{ project.catName }}
        </h2>
        <p class="mb-12 text-md">
          {{ project.introText }}
        </p>
        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <div class="flex flex-col justify-between">
            <div>
              <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
                FEATURED PROJECT
              </div>
              <p class="mb-8 font-extrabold text-gray-900 dark:text-insight">
                <!-- TODO: bind project name -->
                Monitoring the critically endangered mangrove finch
              </p>
              <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
                APPLICATION
              </div>
              <p class="mb-2 text-gray-500 dark:text-insight">
                <!-- TODO: bind application -->
                High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.
              </p>
              <p class="mb-8 text-gray-500 dark:text-insight">
                Results are being utilized to inform current finch distribution across all  potential mangrove habitats to inform action.
              </p>
            </div>
            <a
              href="#"
              class="btn btn-primary w-40"
            >Work with us</a>
          </div>
          <div class="rounded-lg border-1 border-frequency bg-moss p-8 grid grid-cols-2">
            <div class="text-xs uppercase text-spoonbill font-eyebrow">
              TIMELINE
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <!-- TODO: bind timeline -->
              2022 - ongoing
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              <!-- TODO: bind scope -->
              SCOPE
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <!-- TODO: bind scope -->
              34 sites, 2 species
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              PARTNERS
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <!-- TODO: bind partner name -->
              Charles Darwin Foundation
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              SERVICES
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <!-- TODO: bind services -->
              Survey design<br>Expert species validation<br>Ecological analyses<br>AI model development
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              sustainable development goals
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <!-- TODO: bind services -->
              13, 15
            </p>
          </div>
        </div>
      </div>
      <div>
        <img
          class="w-full rounded-lg"
          src="@/_assets/landing/featured/mangrove-finch.jpg"
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

export interface FeaturedProject {
  catName: string
  introText: string
  // projectName: string
  // timeline: string
  // scope: string
  // services: [string]
  // images: [string]
  // goals: [string]
}

const project = withDefaults(defineProps<FeaturedProject>(), {
  catName: 'Endangered species protection',
  introText: 'Utilizing ecoacoustic data, Arbimon isolates the calls of endangered species to map presence over time. This enables implementation of more targeted habitat restoration, areas, and breeding programs.'
})
</script>
