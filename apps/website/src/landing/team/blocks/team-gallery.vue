<template>
  <section class="bg-white dark:bg-pitch px-6 lg:px-10">
    <div class="py-10 mx-auto max-w-screen-xl text-center md:(pt-30 pb-20)">
      <div class="mb-10 lg:mb-20">
        <h1 class="mb-6 text-gray-900 dark:text-frequency">
          See our scientists at work
        </h1>
        <h4 class="text-gray-500 dark:text-insight max-w-[793px] mx-auto text-lg">
          The Arbimon team consists of dedicated experts in biodiversity conservation who are at the forefront of our industry. Our unique perspective enables us to continually drive innovation within the Arbimon platform. We actively employ our platform in our daily research endeavors, allowing us to stay at the cutting edge of technology and features. This commitment empowers us to provide the most effective solutions for individuals seeking to enhance their understanding of biodiversity health and make informed decisions for conservation efforts through the use of ecoacoustics.
        </h4>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <imageCard
          class="order-first col-span-2"
          :src="image1"
        />
        <imageCard
          class="md:order-2 order-3"
          :src="image2"
        />
        <video-card
          class="md:(order-3 col-span-1) order-8 col-span-2"
          :src="guardianVideo"
          :thumbnail-image-src="image3"
        />
        <video-card
          class="md:order-4 order-2"
          :src="dashboardVideo"
          :thumbnail-image-src="image4"
        />
        <imageCard
          class="md:(order-5 row-span-2 h-[440px]) order-6 object-top"
          :src="image5"
        />
        <imageCard
          class="md:order-6 order-5 col-span-2"
          :src="image6"
        />
        <video-card
          class="md:(order-7 col-span-1) order-4 col-span-2"
          :src="fieldVideo"
          :thumbnail-image-src="image7"
        />
        <video-card
          class="md:order-8 order-6"
          :src="walkingInWaterVideo"
          :thumbnail-image-src="image8"
        />
        <imageCard
          class="order-last md:col-span-1 col-span-2"
          :src="image9"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
// TODO: png file might be replaced with gif in the future
import image1 from '@/_assets/landing/team/gallery/1.webp'
import image2 from '@/_assets/landing/team/gallery/2.webp'
import image3 from '@/_assets/landing/team/gallery/3.png'
import image4 from '@/_assets/landing/team/gallery/4.png'
import image5 from '@/_assets/landing/team/gallery/5.webp'
import image6 from '@/_assets/landing/team/gallery/6.webp'
import image7 from '@/_assets/landing/team/gallery/7.png'
import image8 from '@/_assets/landing/team/gallery/8.png'
import image9 from '@/_assets/landing/team/gallery/9.webp'
import dashboardVideo from '@/_assets/landing/team/gallery/dashboard view.mp4'
import fieldVideo from '@/_assets/landing/team/gallery/field.mp4'
import guardianVideo from '@/_assets/landing/team/gallery/guardian.mp4'
import walkingInWaterVideo from '@/_assets/landing/team/gallery/walking in water.mp4'
import imageCard from '../components/image-card.vue'
import videoCard from '../components/video-card.vue'
</script>
