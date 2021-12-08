<template>
  <button
    :disabled="disabled"
    class="btn btn-icon flex flex-row"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 self-center"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
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
