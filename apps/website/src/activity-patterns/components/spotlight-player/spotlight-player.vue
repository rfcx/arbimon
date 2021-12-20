<template>
  <div v-if="!loading">
    <div class="text-lg capitalize">
      Species call
    </div>
    <div
      class="max-w-full my-4 flex justify-left"
    >
      <div class="relative">
        <img
          :src="spectrogram"
          class="max-w-60"
        >
        <div class="absolute bottom-2 right-2">
          <div
            v-if="!playing"
            class="hover:(opacity-80 cursor-pointer)"
            title="Play"
            @click="play()"
          >
            <icon-fa-play />
          </div>
          <div
            v-else
            class="hover:(opacity-80 cursor-pointer)"
            title="Pause"
            @click="pause()"
          >
            <icon-fa-pause />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
