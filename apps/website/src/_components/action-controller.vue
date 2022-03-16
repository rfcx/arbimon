<template>
  <div
    class="hover:(opacity-80 cursor-pointer)"
    :title="actionName"
  >
    <slot />
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class AudioController extends Vue {
  @Prop() actionName!: string
}

</script>
