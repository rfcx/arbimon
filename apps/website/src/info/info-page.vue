<template>
  <div class="text-2xl">
    Supporting information
  </div>
  <div
    v-for="(info, idx) in information"
    :key="'info-' + info.slug"
  >
    <div
      :id="info.slug"
      class="text-xl"
      :class="idx > 0 ? 'mt-16' : 'mt-5' "
    >
      {{ info.title }}
    </div>
    <p class="mt-2 whitespace-pre-line">
      {{ info.content }}
    </p>
  </div>
</template>
<script lang="ts" src="./info-page.ts"></script>
