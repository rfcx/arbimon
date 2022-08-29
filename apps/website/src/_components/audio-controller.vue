<template>
  <action-controller
    v-if="loading"
    action-name="Loading"
    class="hover:cursor-not-allowed"
  >
    <icon-fas-spinner
      class="animate-spin"
      :class="'text-' + size"
    />
  </action-controller>
  <action-controller
    v-else-if="!playing"
    action-name="Play"
  >
    <icon-fa-play :class="'text-' + size" />
  </action-controller>
  <action-controller
    v-else
    action-name="Pause"
  >
    <icon-fa-pause :class="'text-' + size" />
  </action-controller>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class AudioController extends Vue {
  @Prop({ default: false }) playing!: boolean
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: 'sm' }) size!: 'xs' | 'sm' | 'md' | 'lg'
}

</script>
