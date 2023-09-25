<template>
  <div class="grid grid-cols-1 gap-2 bg-stone-900 border-1 border-orange-100 rounded-2xl shadow py-4 px-6 dark:border-orange-100 h-36">
    <div class="flex justify-start rounded-t items-center h-6">
      <h3 class="text-base text-rose-300 text-eyebrow font-normal">
        {{ stat.title }}
      </h3>
      <button :title="stat.title">
        <icon-fas-info-circle class="h-3 w-3 ml-2 text-rose-300 cursor-pointer" />
      </button>
    </div>
    <div class="flex items-center space-x-2 sm:space-x-3">
      <svg
        v-if="stat.value === 'site'"
        class="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M21.5 10C21.5 17 12.5 23 12.5 23C12.5 23 3.5 17 3.5 10C3.5 7.61305 4.44821 5.32387 6.13604 3.63604C7.82387 1.94821 10.1131 1 12.5 1C14.8869 1 17.1761 1.94821 18.864 3.63604C20.5518 5.32387 21.5 7.61305 21.5 10Z"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.5 13C14.1569 13 15.5 11.6569 15.5 10C15.5 8.34315 14.1569 7 12.5 7C10.8431 7 9.5 8.34315 9.5 10C9.5 11.6569 10.8431 13 12.5 13Z"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-if="stat.value === 'recording'"
        class="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M8.5 23H16.5"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.5 19V23"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12.5 1C11.7044 1 10.9413 1.31607 10.3787 1.87868C9.81607 2.44129 9.5 3.20435 9.5 4V12C9.5 12.7956 9.81607 13.5587 10.3787 14.1213C10.9413 14.6839 11.7044 15 12.5 15C13.2956 15 14.0587 14.6839 14.6213 14.1213C15.1839 13.5587 15.5 12.7956 15.5 12V4C15.5 3.20435 15.1839 2.44129 14.6213 1.87868C14.0587 1.31607 13.2956 1 12.5 1V1Z"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.5 10V12C19.5 13.8565 18.7625 15.637 17.4497 16.9497C16.137 18.2625 14.3565 19 12.5 19C10.6435 19 8.86301 18.2625 7.55025 16.9497C6.2375 15.637 5.5 13.8565 5.5 12V10"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-if="stat.value === 'playlist'"
        class="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M8.5 18H21.5"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3.5 18H3.51"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.5 12H21.5"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3.5 12H3.51"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.5 6H21.5"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3.5 6H3.51"
          stroke="#FFFEFC"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-if="stat.value === 'species'"
        class="h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="27"
        height="26"
        viewBox="0 0 27 26"
        fill="none"
      >
        <path
          d="M16.9286 18.3023V25M16.9286 18.3023C20.5857 16.5163 21.0964 13.0175 21.5 11.0465C22.0714 8.25581 21.5 5.46512 21.5 5.46512C21.3095 3.97674 20.1286 1 16.9286 1C13.7286 1 12.9286 3.4186 12.9286 4.90698C12.9286 4.90698 12.9286 7.13954 12.9286 7.69767C12.9286 8.48357 12.4325 8.90461 11.7857 9.37209C8.6969 11.6047 1.5 9.37209 1.5 9.37209C2.04135 12.6714 3.07533 16.3355 6.64286 18.3023C7.58962 18.8161 8.55453 19.1426 9.5 19.3296M16.9286 18.3023C15.6088 19.0185 12.6632 19.9552 9.5 19.3296M9.5 19.3296V25"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M22.0714 6.58154L25.5 8.25596L22.0714 9.93038"
          stroke="white"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <ellipse
          cx="17.5"
          cy="6.02302"
          rx="1.14286"
          ry="1.11628"
          fill="white"
        />
      </svg>
      <icon-fas-spinner
        v-if="stat.isLoading"
        class="animate-spin h-8 w-8 text-white"
      />
      <span
        v-if="stat.count !== undefined"
        class="text-2xl text-white font-header font-medium"
      >{{ valueShortScale }}</span>
    </div>
    <div>
      <a
        class="text-base text-display font-medium leading-4 dark:text-frequency cursor-pointer focus:text-cyan-800 focus:bg-gray-300 border-b-1 border-frequency"
        :href="stat.link"
        target="_blank"
      >
        {{ stat.label }}
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { initTooltips } from 'flowbite'
import numeral from 'numeral'
import { computed, onMounted } from 'vue'

import { type Stat } from '../types'

const props = defineProps<{stat: Stat}>()

onMounted(() => {
  initTooltips()
})

const valueShortScale = computed(() => {
  const formattedNumber = numeral(props.stat.count).format('0.0a')
  const firstDecimalDigit = (x: string) => x.split('.')[1].slice(0, 1)
  return firstDecimalDigit(formattedNumber) === '0' ? formattedNumber.replace('.0', '') : formattedNumber
})

</script>
