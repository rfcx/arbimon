<template>
  <div
    class="flex flex-row rounded-lg border-1 border-frequency h-72 md:h-[500px]"
  >
    <div
      v-if="!isShowingBio"
      class="w-full h-full flex flex-row md:flex-col-reverse"
    >
      <div class="flex flex-col items-start justify-between content-stretch pt-6 px-6 pb-8 text-left self-stretch flex-grow flex-1">
        <div class="">
          <span class="text-flamingo text-lg">
            {{ name }}
          </span>
          <p
            class="font-medium py-2"
            :aria-label="role"
          >
            {{ role }}
          </p>
        </div>
        <button
          class="cursor-pointer text-frequency font-display flex flex-row gap-2"
          @click="isShowingBio = true"
        >
          <span class="inline-flex">About</span>
          <svg
            class="inline-flex not-sr-only"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5 12H19"
              stroke="#ADFF2C"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 5L19 12L12 19"
              stroke="#ADFF2C"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <img
        class="rounded-r-lg border-l-1 border-l-frequency border-b-0 w-1/2 h-full md:(w-full h-2/3 rounded-t-lg rounded-br-none border-b-1 border-b-frequency border-l-0) object-cover"
        :src="imageUrl"
        :alt="'Image of ' + name"
      >
    </div>
    <div
      v-else
      class="h-full w-full bg-frequency pt-6 px-6 pb-8 flex flex-col justify-between gap-4 text-left items-stretch rounded-lg"
    >
      <div>
        <div class="flex flex-row justify-between mb-4">
          <span class="text-flamingo text-lg">
            {{ name }}
          </span>
          <button
            class="cursor-pointer text-util-gray-03"
            @click="isShowingBio = false"
          >
            <span class="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18"
                stroke="#242424"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#242424"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <p
          class="text-util-gray-03"
          :aria-label="'Bio of ' + name"
        >
          {{ bio }}
        </p>
      </div>
      <a
        :href="linkedInUrl"
        class="text-util-gray-03 hover-underline font-display"
        aria-label="LinkedIn"
      >
        <span class="inline-block mr-2">LinkedIn</span>
        <svg
          class="inline-block"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5 12H19"
            stroke="#242424"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 5L19 12L12 19"
            stroke="#242424"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const isShowingBio = ref<boolean>(false)
defineProps<{
  readonly imageUrl: string
  readonly name: string
  readonly role: string
  readonly bio: string
  readonly linkedInUrl: string
}>()
</script>
