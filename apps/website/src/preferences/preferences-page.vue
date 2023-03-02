<template>
  <div class="p-4">
    <page-title
      page-title="Customize Colors"
      page-subtitle="under construction"
    />

    <div class="grid grid-cols-2">
      <div>
        <h2 class="mt-5 text-xl">
          On background:
        </h2>
        <div class="mt-4 p-8">
          <div
            v-for="color in [...store.datasetColors, '#FFFFFF']"
            :key="color"
            class="w-full inline-block p-4 text-xl uppercase text-black"
            :style="{ backgroundColor: color }"
          >
            {{ color }}
          </div>
        </div>
      </div>
      <div>
        <h2 class="mt-5 text-xl">
          On satellite map:
        </h2>
        <div
          class="mt-4 p-8"
          style="background-color: #3B5E22;"
        >
          <div
            v-for="color in [...store.datasetColors, '#FFFFFF']"
            :key="color"
            class="w-full inline-block p-4 text-xl uppercase text-black"
            :style="{ backgroundColor: color }"
          >
            {{ color }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./preferences-page" lang="ts"></script>
