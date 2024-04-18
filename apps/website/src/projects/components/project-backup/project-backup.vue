<template>
  <div class="mt-6 flex flex-col gap-y-4">
    <h4>
      Project backup
    </h4>
    <div class="flex flex-col xl:flex-row gap-6 justify-between">
      <div class="w-full xl:w-2/4">
        <p>
          You can request a comprehensive backup—including all raw recordings, job results, metadata, and Insights visuals—every 7 days. Once requested, your download link will be ready within 24 hours. Remember, download links expire after 7 days, so be sure to save your backup promptly.
        </p>
        <button
          class="btn btn-secondary group mt-6"
          type="button"
        >
          Request backup <icon-custom-ic-export class="ml-2 inline-flex" />
        </button>
      </div>
      <project-backup-history :data="[]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectBackupHistory from './project-backup-history.vue'
</script>
