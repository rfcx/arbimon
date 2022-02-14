<template>
  <div v-if="!loading">
    <h3 class="text-lg text-subtle border-b-2 border-subtle">
      Detected audio
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
          <audio-controller
            :playing="playing"
            @click="playing ? pause() : play()"
          />
        </div>
      </div>
    </div>
    <div
      class="fixed w-72 h-12 inset-x-0 mx-auto z-50 px-4 py-2 bg-steel-grey-light rounded-md transition-all duration-500"
      :class="playing ? 'bottom-4' : '-bottom-12'"
    >
      <div class="h-full flex items-center content-center">
        <audio-controller
          :playing="playing"
          @click="playing ? pause() : play()"
        />
        <div
          class="relative w-full mx-2"
          @click="setAudioPlayProgerss($event)"
        >
          <div
            class="absolute w-full h-1 bg-white opacity-50 rounded-full cursor-pointer"
          />
          <div
            class="absolute h-1 bg-white rounded-full z-51 cursor-pointer"
            :style="{ width: playedProgressPercentage + '%' }"
          />
        </div>
        <div>{{ displayPlayedTime }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
