<template>
  <div
    v-if="!playing"
    class="hover:(opacity-80 cursor-pointer)"
    title="Species call"
    @click="play()"
  >
    <icon-fa-volume-up />
  </div>
  <div
    v-else
    class="hover:(opacity-80 cursor-pointer)"
    title="Pause"
    @click="pause()"
  >
    <icon-fa-pause />
  </div>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
