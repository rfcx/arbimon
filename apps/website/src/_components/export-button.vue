<template>
  <button
    :disabled="disabled"
    class="btn btn-icon flex flex-row"
  >
    <icon-custom-download />
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
