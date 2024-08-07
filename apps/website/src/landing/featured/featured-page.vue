<template>
  <section class="bg-white dark:bg-echo">
    <hero-content :hero-image-url="heroImage">
      <h1 class="text-giant mb-4 text-gray-900 dark:text-frequency">
        Featured work
      </h1>
      <h4 class="text-gray-500 dark:text-insight">
        See how Arbimon has been applied in real-world scenarios to advance wildlife conservation and research efforts around the globe.
      </h4>
    </hero-content>
    <div class="grid md:grid-cols-12 max-w-screen-xl mx-auto py-8 lg:(pt-20)">
      <aside class="md:col-span-4 px-4 md:sticky md:h-screen md:top-4 mb-6">
        <button
          id="category-menu-trigger"
          data-collapse-toggle="category-menu"
          type="button"
          class="w-full items-center py-2 border-b-1 border-insight dark:text-insight md:hidden dark:hover:ring-moss"
          aria-controls="category-menu"
          aria-expanded="false"
        >
          <div class="flex flex-row justify-between items-start">
            <span>Jump to</span>
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="transform"
              :class="isCollapsed ? '' : 'rotate-180'"
            >
              <g id="fi:chevron-down">
                <path
                  id="Vector"
                  d="M6.91992 9L12.9199 15L18.9199 9"
                  stroke="#FFFEFC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </div>
        </button>
        <ul
          id="category-menu"
          class="hidden mb-4 mt-4 md:(block mt-0)"
        >
          <li
            v-for="item in projects"
            :key="item.id"
            class="mb-4"
          >
            <router-link
              :to="'#' + item.category.id"
              :class="currenRoute.hash === '#' + item.category.id ? 'text-frequency font-medium border-b-2 border-b-frequency' : 'text-gray-500 dark:text-insight'"
            >
              {{ item.category.name }}
            </router-link>
          </li>
        </ul>
      </aside>
      <div class="items-stretch gap-10 overflow-y-auto flex flex-col px-4 md:(pb-64 col-span-8)">
        <card
          v-for="item in projects"
          :id="item.category.id"
          :key="item.id"
          :title="item.title"
          :subtitle="item.header.projectName"
          :location="item.location"
          :link="'/featured/' + item.category.id"
          :background-image="item.featuredImage"
        />
      </div>
    </div>
  </section>
  <footer-contact />
</template>
<script setup lang="ts">
import { Collapse, initCollapses } from 'flowbite'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import heroImage from '@/_assets/landing/featured/feature-hero.webp'
import HeroContent from '@/_layout/components/hero-content.vue'
import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import Card from './components/featured-card.vue'
import { projects } from './data'

const currenRoute = useRoute()
const collapse = ref<Collapse | null>(null)
const isCollapsed = ref(true)

onMounted(() => {
  initCollapses()

  const $el: HTMLElement | null = document.getElementById('category-menu')
  const $triggerEl: HTMLElement | null = document.getElementById('category-menu-trigger')

  const options = {
    onCollapse: () => {
        isCollapsed.value = true
    },
    onExpand: () => {
        isCollapsed.value = false
    }
  }

  collapse.value = new Collapse($el, $triggerEl, options)
})

</script>
