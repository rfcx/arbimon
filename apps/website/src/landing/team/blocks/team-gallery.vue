<template>
  <section class="bg-white dark:bg-pitch px-6 lg:px-10">
    <div class="py-10 mx-auto max-w-screen-xl text-center md:(pt-30 pb-20)">
      <div class="mb-10 lg:mb-20">
        <h1 class="mb-6 text-gray-900 dark:text-frequency">
          See our scientists at work
        </h1>
        <h4 class="text-gray-500 dark:text-insight max-w-[793px] mx-auto">
          We're a full-service solution to biodiversity monitoring projects with exceptional support covering everything from site selection to data insight analysis.
        </h4>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <imageCard
          class="order-first col-span-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F1.webp?alt=media&token=e6db8af4-77bf-466a-a23d-8cdce53aa838"
        />
        <imageCard
          class="md:order-2 order-3"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F2.webp?alt=media&token=0f1a291b-1ce5-4161-8a8c-9dc88fd5dc30"
        />
        <imageCard
          class="md:(order-3 col-span-1) order-8 col-span-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F3.gif?alt=media&token=5c9fdcd9-3975-410a-88fc-90b878c48ece"
        />
        <imageCard
          class="md:order-4 order-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F5.gif?alt=media&token=00b2ac4f-a702-44e3-9f0e-d7a836411607"
        />
        <imageCard
          class="md:(order-5 row-span-2 h-[440px]) order-6 object-top"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F5.webp?alt=media&token=0b11f20e-0e4e-4300-8c18-fa8fee26ae1e"
        />
        <imageCard
          class="md:order-6 order-5 col-span-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F6.webp?alt=media&token=3020525c-7416-4e86-908d-dd2553995cef"
        />
        <imageCard
          class="md:(order-7 col-span-1) order-4 col-span-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F7.gif?alt=media&token=f4f19843-d33e-43dc-977c-ffab7f4190f1"
        />
        <imageCard
          class="md:order-8 order-6"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F8.gif?alt=media&token=c3ddb3ca-55f9-42d3-b4b5-676bdfa80bd7"
        />
        <imageCard
          class="order-last md:col-span-1 col-span-2"
          src="https://firebasestorage.googleapis.com/v0/b/rfcx-demo.appspot.com/o/landing%2Fteam%2Fgallery%2F9.webp?alt=media&token=78120895-826a-4d61-9609-4d59eb55aeb5"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import imageCard from '../components/image-card.vue'
</script>
