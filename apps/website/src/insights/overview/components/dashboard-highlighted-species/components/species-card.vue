<template>
  <img
    v-if="photoUrl"
    :src="photoUrl"
    class="h-14 w-14 object-cover rounded bg-util-gray-02"
  >
  <div
    v-else
    class="h-14 w-14 object-cover rounded bg-util-gray-02"
  />
  <div class="self-center md:overflow-hidden">
    <p
      class="text-s italic tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
      :title="scientificName"
    >
      {{ scientificName }}
    </p>
    <p
      class="mt-1 text-xs tracking-tight line-clamp-2 md:(overflow-hidden text-ellipsis)"
      :title="commonName || 'Unknown'"
    >
      {{ commonName || 'Unknown' }}
    </p>
  </div>
</template>

<script setup lang="ts">

defineProps<{ slug: string, scientificName: string, commonName: string | undefined, photoUrl: string | undefined }>()

</script>
