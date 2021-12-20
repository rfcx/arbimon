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
          <audio-controller
            :playing="playing"
            @click="playing ? pause() : play()"
          />
        </div>
      </div>
    </div>
    <div
      class="fixed w-72 h-12 bottom-4 inset-x-0 mx-auto z-50 px-4 py-2 bg-steel-grey-light rounded-md"
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
