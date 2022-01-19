<template>
  <button
    :disabled="disabled"
    class="btn btn-icon flex items-center"
  >
    <icon-custom-download class="h-4 w-4" />
    <slot name="label" />
  </button>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class ExportButtonView extends Vue {
  @Prop({ default: false }) disabled!: boolean
}
</script>
