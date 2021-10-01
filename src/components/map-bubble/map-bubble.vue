<template>
  <div>
    <div
      v-if="!hasData"
      class="h-full flex justify-center items-center text-secondary border-2 border-secondary"
    >
      No data
    </div>
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="mapIdFull"
        class="w-full h-96 text-black"
      />
      <button
        class="absolute bottom-2 right-2 btn btn-icon"
        @click="downloadPng()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts"></script>
