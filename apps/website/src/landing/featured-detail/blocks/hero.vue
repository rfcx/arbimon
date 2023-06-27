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
          {{ props.info?.title }}
        </h2>
        <p class="mb-12 text-md">
          {{ props.info?.description }}
        </p>
        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <div class="flex flex-col justify-between">
            <div>
              <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
                FEATURED PROJECT
              </div>
              <p class="mb-8 font-extrabold text-gray-900 dark:text-insight">
                {{ props.info?.projectName }}
              </p>
              <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
                APPLICATION
              </div>
              <p
                v-for="(application, index) in props.info?.applications"
                :key="index"
                class="mb-2 text-gray-500 dark:text-insight"
              >
                {{ application }}
              </p>
            </div>
            <a
              href="#"
              class="btn btn-primary w-40"
            >Work with us</a>
          </div>
          <div class="rounded-lg border-1 border-frequency bg-moss p-8 grid grid-rows-1 lg:grid-cols-2">
            <div class="text-xs uppercase text-spoonbill font-eyebrow">
              TIMELINE
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              {{ props.info?.timeline }}
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              SCOPE
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              {{ props.info?.scope }}
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              PARTNERS
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <ul>
                <li
                  v-for="(partner, index) in props.info?.partners"
                  :key="index"
                >
                  {{ partner }}
                </li>
              </ul>
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              SERVICES
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <ul>
                <li
                  v-for="(service, index) in props.info?.services"
                  :key="index"
                >
                  {{ service }}
                </li>
              </ul>
            </p>
            <div class="mb-2 text-xs uppercase text-spoonbill font-eyebrow">
              sustainable development goals
            </div>
            <p class="mb-4 text-gray-900 dark:text-insight">
              <span
                v-for="(goal, index) in props.info?.sdgs"
                :key="index"
              >{{ goal }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="h-screen-sm">
        <img
          class="w-full h-full object-none rounded-lg bg-gray-100 dark:bg-moss"
          :src="image"
          :alt="image"
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import { type ProjectHeader } from '../../featured/data/types'

const props = defineProps<{
  readonly info: ProjectHeader | null
  readonly image: string
}>()

</script>
