<template>
  <action-controller
    v-if="!playing"
    action-name="Play"
  >
    <icon-fa-play />
  </action-controller>
  <action-controller
    v-else
    action-name="Pause"
  >
    <icon-fa-pause />
  </action-controller>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class AudioController extends Vue {
  @Prop() playing!: boolean
}

</script>
