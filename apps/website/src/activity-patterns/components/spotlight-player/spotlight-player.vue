<template>
  <audio controls>
    <source
      :src="speciesCall.mediaWavUrl"
      type="audio/mpeg"
    >
    Your browser does not support the audio element.
  </audio>
</template>
<script lang="ts" src="./spotlight-player.ts"></script>
