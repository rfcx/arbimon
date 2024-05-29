<template>
  <section class="bg-hero-testimonial bg-center bg-cover">
    <div>
      <div class="max-w-screen-xl mx-auto py-10 md:py-20 lg:py-30 px-4 lg:px-10 flex flex-col lg:flex-row gap-20">
        <div class="basis-5/12">
          <h1 class="text-frequency mb-4">
            Our purpose
          </h1>
          <div class="text-base lg:text-lg">
            <p class="pb-3 last:pb-0">
              We aim to safeguard and nurture Earth's ecosystems for every creature that calls it home. By harnessing the power of sound, we unlock a deeper understanding of biodiversity, vital for conservation efforts.
            </p>
            <p class="pb-3 last:pb-0">
              With cutting-edge AI technology and acoustic innovation, Arbimon empowers individuals and organizations to transform sound into actionable insights.
            </p>
          </div>
        </div>
        <div class="basis-7/12">
          <div
            v-if="videoError"
            class="youtube-container rounded-2xl flex items-center justify-center h-full bg-moss"
          >
            <span>
              It seems the video didn’t load as expected. <br>
              Please refresh your browser to give it another go.
            </span>
          </div>
          <div
            v-else
            class="youtube-container rounded-2xl"
          >
            <iframe
              src="https://www.youtube.com/embed/o8HStpFbc5M?start=12&end=99&autoplay=1&mute=1&loop=1&color=white&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=o8HStpFbc5M"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              @error="videoError = true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const videoError = ref(false)
</script>

<style lang="scss">
.youtube-container {
    overflow: hidden;
    width: 100%;
    /* Keep it the right aspect-ratio */
    aspect-ratio: 16/9;

    iframe {
      /* Extend it beyond the viewport... */
      width: 100%;
      height: 100%;
      /* ...and bring it back again */
    }
}
</style>
