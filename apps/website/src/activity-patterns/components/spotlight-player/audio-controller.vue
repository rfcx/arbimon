<template>
  <div
    v-if="!playing"
    class="hover:(opacity-80 cursor-pointer)"
    title="Play"
  >
    <icon-fa-play />
  </div>
  <div
    v-else
    class="hover:(opacity-80 cursor-pointer)"
    title="Pause"
  >
    <icon-fa-pause />
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class AudioController extends Vue {
  @Prop() playing!: boolean
}

</script>
