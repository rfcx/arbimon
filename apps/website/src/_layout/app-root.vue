<template>
  <router-view />
  <!-- Global floating upload tray: shows whenever an upload queue exists,
       survives route changes (the engine is an app-wide singleton). -->
  <upload-tray />
</template>

<script setup lang="ts">
import UploadTray from '@/_components/upload-tray/upload-tray.vue'
</script>
