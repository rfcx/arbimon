<template>
  <section class="bg-white dark:bg-echo">
    <div class="gap-10 items-center py-10 px-4 mx-auto max-w-screen-xl xl:(grid grid-cols-12 pr-0) 2xl:(mx-auto)">
      <div class="text-gray-500 dark:text-insight col-span-8">
        <router-link
          to="/featured"
          class="text-sm flex items-center"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="insight"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-insight transition-colors duration-300"
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
          <span class="ml-1 hover:underline">Back to featured work</span>
        </router-link>
        <h1 class="mt-10 my-4 capitalize text-gray-900 dark:text-insight">
          {{ title }}
        </h1>
        <p class="mb-10 text-md">
          {{ description }}
        </p>
        <div class="grid md:grid-cols-2 mb-8 xl:mb-0 gap-8">
          <div class="flex flex-col gap-y-6">
            <div>
              <featured-stat title="FEATURED PROJECT">
                {{ info?.projectName }}
              </featured-stat>

              <featured-stat title="APPLICATION">
                <p
                  v-for="(application, index) in info?.applications"
                  :key="index"
                  class="mb-2 text-gray-500 dark:text-insight"
                >
                  {{ application }}
                </p>
              </featured-stat>
            </div>
            <router-link
              :to="{ name: ROUTE_NAMES.landingContact }"
              class="btn btn-primary w-48"
            >
              Work with us
            </router-link>
          </div>
          <div class="rounded-lg border-1 border-frequency bg-moss p-8 grid grid-rows-1 xl:grid-cols-3">
            <featured-stat title="timeline">
              <span class="text-sm lowercase first-letter:capitalize">{{ info?.timeline }}</span>
            </featured-stat>
            <featured-stat title="scope">
              <span class="text-sm lowercase first-letter:capitalize">{{ info?.scope }}</span>
            </featured-stat>
            <featured-stat title="partners">
              <ul class="list-disc ml-4 text-sm">
                <li
                  v-for="(partner, index) in info?.partners"
                  :key="index"
                >
                  {{ partner }}
                </li>
              </ul>
            </featured-stat>
            <featured-stat title="services">
              <ul class="list-disc ml-4 text-sm">
                <li
                  v-for="(service, index) in info?.services"
                  :key="index"
                  class="lowercase first-letter:capitalize"
                >
                  {{ service }}
                </li>
              </ul>
            </featured-stat>
            <featured-stat
              v-if="info?.sdgs && info?.sdgs.length > 0"
              title="sustainable development goals"
            >
              <div class="grid grid-cols-5 gap-2 xl:grid-cols-3">
                <img
                  v-for="(goal, index) in info?.sdgs"
                  :key="index"
                  :src="masterSDGs[`G${goal}`].image"
                  class=""
                  :alt="'Goal ' + masterSDGs[`G${goal}`].id + ': ' + masterSDGs[`G${goal}`].name"
                >
              </div>
            </featured-stat>
          </div>
        </div>
      </div>
      <div class="items-end self-stretch sm:h-md xl:(h-full pt-16) col-span-4">
        <img
          class="w-full h-full object-none xl:object-cover rounded-lg bg-gray-100 dark:bg-moss"
          :src="image"
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '~/router'
import { type ProjectHeader, masterSDGs } from '../../featured/data/types'
import FeaturedStat from '../components/featured-stat.vue'

defineProps<{
  readonly info: ProjectHeader | null
  readonly title: string
  readonly description: string
  readonly image: string
}>()

</script>
