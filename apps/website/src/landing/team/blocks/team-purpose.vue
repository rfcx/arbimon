<template>
  <section class="bg-hero-testimonial bg-center bg-cover">
    <div class="bg-gradient-to-b from-pitch/[.1] to-pitch">
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
            <p class="pb-3 last:pb-0">
              Collaboration is at the heart of our approach. We actively engage with ecologists, foundations, governments, corporations, and local communities to extend the reach and impact of our initiatives.
            </p>
          </div>
        </div>
        <div class="basis-7/12">
          <img
            :src="image"
            class="rounded-2xl"
          >
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import image from '@/_assets/landing/team/Landscape_45.webp'
</script>
