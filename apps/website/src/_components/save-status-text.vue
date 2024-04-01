<template>
  <span
    v-if="success"
    class="pt-4 text-sm inline-flex"
    role="alert"
  >
    <svg
      class="w-4 h-4 ml-1"
      aria-hidden="true"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 20.292969 5.2929688 L 9 16.585938 L 4.7070312 12.292969 L 3.2929688 13.707031 L 9 19.414062 L 21.707031 6.7070312 L 20.292969 5.2929688 z" />
    </svg>
    <span class="font-medium ml-2 mt-0.15rem">{{ `Last saved on ${dayjs(new Date()).format('MMM DD, YYYY')} at ${dayjs(new Date()).format('HH:mm:ss')}` }}</span>
  </span>
  <span
    v-else
    class="pt-4 text-sm text-red-800 dark:text-flamingo"
    role="alert"
  >
    <span class="font-medium">{{ errorMessage ?? 'Failed!' }}</span>
  </span>
</template>

<script setup lang="ts">
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

defineProps<{success: boolean, errorMessage?: string}>()
</script>
