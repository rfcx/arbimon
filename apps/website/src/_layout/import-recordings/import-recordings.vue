<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10)">
    <div class="grid grid-cols-1 md:grid-cols-2 mt-16 2xl:mt-36 gap-x-10">
      <div class="flex items-center">
        <div>
          <h1 class="md:text-5xl">
            Import Recordings with Arbimon Uploader
          </h1>
          <h3 class="mt-6 mb-4">
            Use the Arbimon Uploader app to seamlessly upload large WAV or FLAC files to the Arbimon cloud. Uploads happen in the background, allowing you to continue working uninterrupted.
          </h3>
          <span class="text-base font-normal">
            Need help? <a
              href="https://help.arbimon.org/article/179-using-the-arbimon-uploader-app"
              class="text-base text-frequency font-normal font-sans leading-normal hover:underline"
            >Visit our support page</a> for detailed instructions and troubleshooting.
          </span>
          <div class="flex gap-x-6">
            <button
              class="btn block btn-primary flex w-full text-xs justify-center items-center space-x-3 px-6 py-3 mt-6 disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
              type="button"
            >
              <span class="font-display text-base">Download for Mac</span>
              <icon-custom-ic-apple-logo class="h-4 w-4 mb-3px" />
            </button>
            <button
              class="btn block btn-primary flex w-full text-xs justify-center items-center space-x-3 px-6 py-3 mt-6 disabled:cursor-not-allowed disabled:btn-disabled disabled:hover:btn-disabled"
              type="button"
            >
              <span class="font-display text-base">Download for Windows</span>
              <icon-custom-ic-window-logo class="h-4 w-4 mb-3px" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center">
        <img :src="importRecordings">
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import importRecordings from '@/_assets/import-recordings.png'
</script>
