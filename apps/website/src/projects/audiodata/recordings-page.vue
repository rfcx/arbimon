<template>
  <section class="py-20 bg-white dark:bg-pitch pl-18 site-page">
    <div class="flex flex-col px-8 bg-white dark:bg-pitch">
      <h1 class="ml-1 text-gray-900 dark:text-insight">
        Recordings
      </h1>
      <div class="flex mt-7">
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="filterRecordings()"
        >
          <span>Filters</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="exportRecordings()"
        >
          <span>Export</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="saveToPlaylist()"
        >
          <span>Save to Playlist</span>
        </button>
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-3"
          @click="deleteRecording()"
        >
          <span>Delete</span>
          <icon-custom-el-angle-down class="ml-2 w-3 h-3" />
        </button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
const filterRecordings = () => {
  console.info('FilterRecordings')
}
const exportRecordings = () => {
  console.info('exportRecordings')
}
const saveToPlaylist = () => {
  console.info('saveToPlaylist')
}
const deleteRecording = () => {
  console.info('deleteRecording')
}
</script>
