<template>
  <div class="relative overflow-hidden bg-white border border-frequency rounded-lg shadow">
    <img
      class="object-cover w-full h-96"
      :src="backgroundImage"
      alt=""
    >
    <div class="absolute bottom-0 inset-x-0 p-5 bg-transparent border-t border-t-frequency bg-black bg-opacity-75">
      <div class="flex flex-row gap-2 text-spoonbill">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-spoonbill"
          stroke="spoonbill"
        >
          <g clip-path="url(#clip0_1876_5445)">
            <path
              d="M14 6.66663C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66663C2 5.07533 2.63214 3.5492 3.75736 2.42399C4.88258 1.29877 6.4087 0.666626 8 0.666626C9.5913 0.666626 11.1174 1.29877 12.2426 2.42399C13.3679 3.5492 14 5.07533 14 6.66663Z"
              stroke="spoonbill"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 8.66663C9.10457 8.66663 10 7.7712 10 6.66663C10 5.56206 9.10457 4.66663 8 4.66663C6.89543 4.66663 6 5.56206 6 6.66663C6 7.7712 6.89543 8.66663 8 8.66663Z"
              stroke="spoonbill"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_1876_5445">
              <rect
                width="16"
                height="16"
                fill="white"
              />
            </clipPath>
          </defs>
        </svg>

        <p class="leading-normal text-sm text-spoonbill uppercase pb-2 font-['Roboto']">
          {{ location }}
        </p>
      </div>
      <h2 class="mt-1 text-xl font-bold tracking-tight text-insight pb-2 lg:text-2xl">
        {{ title }}
      </h2>
      <p class="text-insight pb-2 line-clamp-2 text-sm lg:text-base">
        {{ subtitle }}
      </p>
      <a
        :href="link"
        class="text-frequency hover:border-b hover:border-b-frequency my-2 font-display"
      >Learn more</a>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ backgroundImage: string, title: string, subtitle: string, location: string, link: string }>()
</script>
