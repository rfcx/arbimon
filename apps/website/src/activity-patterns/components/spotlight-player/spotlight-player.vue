<template>
  <div v-if="!loading">
    <h3 class="text-lg capitalize">
      Species call
    </h3>
    <div
      class="my-4 flex justify-left"
    >
      <div class="relative">
        <img
          :src="spectrogram"
          class="w-40"
        >
        <div class="absolute bottom-3 right-3">
          <div
            v-if="!playing"
            class="hover:(opacity-80 cursor-pointer)"
            title="Play"
            @click="play()"
          >
            <icon-fas-play />
          </div>
          <div
            v-else
            class="hover:(opacity-80 cursor-pointer)"
            title="Pause"
            @click="pause()"
          >
            <icon-fas-pause />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
