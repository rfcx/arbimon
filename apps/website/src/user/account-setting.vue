<template>
  <landing-navbar />
  <section class="pt-16 bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10 border-b-1 border-white/80">
      <h1 class="tracking-tight font-medium text-gray-900 dark:text-white">
        Edit profile
      </h1>
    </div>
    <div class="py-8 px-4 mx-auto max-w-screen-md lg:py-10 border-b-1 border-white/80">
      <div class="flex items-start gap-4 flex-col md:flex-row">
        <img
          :src="image"
          alt="Profile picture"
          class="w-32 h-32 aspect-square object-cover rounded-full mr-4"
        >
        <div>
          <h2>
            Change profile profile
          </h2>
          <h4 class="mt-3">
            JPG and PNG files less than 5 MB are supported.
          </h4>
          <button
            class="btn btn-secondary group mt-5"
            type="button"
            @click="uploadPhoto"
          >
            UploadPhoto <icon-custom-cloud-upload class="ml-2 group-hover:stroke-pitch inline-flex" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// TODO :: Change to real image
import image from '@/_assets/cta/frog-hero.webp'

const uploadPhoto = async (): Promise<void> => {
  // TODO :: uploadPhoto
}

</script>
