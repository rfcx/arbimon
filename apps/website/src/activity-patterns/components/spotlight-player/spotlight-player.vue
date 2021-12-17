<template>
  <div
    v-if="!playing"
    class="hover:(opacity-80 cursor-pointer)"
    @click="play()"
  >
    <icon-fa-play />
  </div>
  <div
    v-else
    class="hover:(opacity-80 cursor-pointer)"
    @click="pause()"
  >
    <icon-fa-pause />
  </div>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
