<template>
  <h3 class="text-lg text-subtle border-b-1 border-subtle pb-1">
    Detected audio
  </h3>
  <no-data-panel
    v-if="loading || isEmpty"
    :empty-text="loading ? 'loading...' : 'no data'"
    class="h-40 my-4"
  />
  <div
    v-else
    class="relative group"
  >
    <button
      class="absolute left-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-grey bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
      @click="scrollContent('left')"
    >
      <icon-custom-chevron-left class="text-xxs m-auto" />
    </button>
    <div
      id="spectrogram-container"
      class="flex overflow-auto scrollbar-hide"
    >
      <div
        v-for="(spectrogram, idx) in spectrograms"
        :key="'spectrogram-' + idx"
        class="my-4 not-first:ml-2"
      >
        <div class="relative w-40">
          <img
            :src="spectrogram"
            class="rounded-md"
          >
          <div class="absolute bottom-2 left-2 right-2">
            <div class="flex justify-between">
              <action-controller action-name="Visualizer">
                <a :href="speciesCalls[idx].callMediaRedirectUrl">
                  <icon-fa-cubes class="text-md" />
                </a>
              </action-controller>
              <audio-controller
                :playing="playing && (playingAudioIndex === idx)"
                @click="setAudioIndex(idx)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      class="absolute right-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-grey bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
      @click="scrollContent('right')"
    >
      <icon-custom-chevron-right class="text-xxs m-auto" />
    </button>
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
