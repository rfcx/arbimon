<template>
  <div :class="$attrs.class">
    <label
      for="search"
      class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
    >
      Search
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            stroke="white"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      <input
        id="search"
        class="block w-full p-4 pl-10 text-md text-white/80 border border-white rounded-lg bg-transparent focus:ring-frequency focus:border-frequency dark:bg-transparent dark:border-white/80 dark:placeholder-white/80 dark:text-white/80 dark:focus:ring-frequency dark:focus:border-frequency"
        type="search"
        placeholder="Search for author, species, etc."
        :value="modelValue"
        @input="onInputEnter"
      >
    </div>
    <h2 class="text-white text-2xl font-medium leading-loose mt-6">
      Paper published by
    </h2>
    <ul>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 first:mt-2 mt-0">
        Arbimon Science Team
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 first:mt-2 mt-0">
        ALL
      </li>
    </ul>
    <h2 class="text-white text-2xl font-medium leading-loose mt-6">
      Publications by year
    </h2>
    <ul>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2023">
          2023
        </a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a
          href="#2022"
          class="underline underline-offset-4 decoration-frequency text-frequency"
        >2022</a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2021">2021</a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2020">2020</a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2019">2019</a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2018">2018</a>
      </li>
      <li class="text-white text-base font-normal leading-normal mb-2 last:mb-0 mt-0 first:mt-2">
        <a href="#2017">See previous years</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emits = defineEmits<{(e: 'update:modelValue', value: string): void}>()

const onInputEnter = (ev: Event): void => {
  const target = ev.target as HTMLInputElement
  emits('update:modelValue', target.value)
}
</script>
